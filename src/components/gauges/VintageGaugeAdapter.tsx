import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box, CircularProgress } from '@mui/material';

// Import the vintage gauge components
import { GaugeBezel } from './vintage/GaugeBezel';
import { GaugeNeedle } from './vintage/GaugeNeedle';
import { materials, updateMaterialEnvironment } from '../../materials/luxuryMaterials';
import { getGaugeAngle } from '../../utils/gaugeConfig';

interface VintageGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  redZone?: [number, number];
  yellowZone?: [number, number];
  size?: 'small' | 'medium' | 'large';
}

const GaugeFace: React.FC<{
  label: string;
  unit: string;
  min: number;
  max: number;
  redZone?: [number, number];
  yellowZone?: [number, number];
}> = ({ label, unit, min, max, redZone, yellowZone }) => {
  const createGaugeMarkings = () => {
    const markings = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const angle = -135 + (i / steps) * 180;
      const radian = (angle * Math.PI) / 180;
      const isMainMark = i % 2 === 0;
      const length = isMainMark ? 0.04 : 0.02;
      const width = isMainMark ? 0.003 : 0.002;
      
      const innerRadius = 0.35;
      const outerRadius = innerRadius + length;
      
      markings.push(
        <mesh key={`mark-${i}`} rotation={[0, 0, radian]}>
          <boxGeometry args={[width, length, 0.001]} />
          <meshPhysicalMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.5} />
        </mesh>
      );
      
      // Add number labels for main marks
      if (isMainMark) {
        const value = min + (i / steps) * (max - min);
        const labelRadius = innerRadius - 0.08;
        const x = Math.cos(radian) * labelRadius;
        const y = Math.sin(radian) * labelRadius;
        
        // Number text would go here - in production, use Text from drei
      }
    }
    
    return markings;
  };
  
  const createZones = () => {
    const zones = [];
    
    if (redZone) {
      const [start, end] = redZone;
      const startAngle = getGaugeAngle(start, min, max);
      const endAngle = getGaugeAngle(end, min, max);
      
      zones.push(
        <mesh key="red-zone" rotation={[0, 0, (startAngle + endAngle) / 2]}>
          <ringGeometry args={[0.38, 0.42, 32, 1, 0, endAngle - startAngle]} />
          <meshPhysicalMaterial 
            color={0xff0000} 
            transparent 
            opacity={0.3}
            emissive={0xff0000}
            emissiveIntensity={0.2}
          />
        </mesh>
      );
    }
    
    if (yellowZone) {
      const [start, end] = yellowZone;
      const startAngle = getGaugeAngle(start, min, max);
      const endAngle = getGaugeAngle(end, min, max);
      
      zones.push(
        <mesh key="yellow-zone" rotation={[0, 0, (startAngle + endAngle) / 2]}>
          <ringGeometry args={[0.38, 0.42, 32, 1, 0, endAngle - startAngle]} />
          <meshPhysicalMaterial 
            color={0xffff00} 
            transparent 
            opacity={0.3}
            emissive={0xffff00}
            emissiveIntensity={0.1}
          />
        </mesh>
      );
    }
    
    return zones;
  };
  
  return (
    <group>
      {/* Gauge background */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.45, 64]} />
        <primitive object={materials.blackDial} attach="material" />
      </mesh>
      
      {/* Markings */}
      <group position={[0, 0, 0.001]}>
        {createGaugeMarkings()}
      </group>
      
      {/* Color zones */}
      <group position={[0, 0, 0.002]}>
        {createZones()}
      </group>
      
      {/* Center label */}
      <mesh position={[0, -0.15, 0.003]}>
        <planeGeometry args={[0.3, 0.05]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Unit label */}
      <mesh position={[0, -0.2, 0.003]}>
        <planeGeometry args={[0.2, 0.04]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

const VintageGauge: React.FC<VintageGaugeProps> = ({
  value,
  min,
  max,
  label,
  unit = '',
  redZone,
  yellowZone,
  size = 'medium'
}) => {
  const needleRef = useRef<THREE.Group>();
  const targetAngle = getGaugeAngle(value, min, max);
  
  useFrame((state, delta) => {
    if (needleRef.current) {
      // Smooth needle animation
      const currentAngle = needleRef.current.rotation.z;
      const diff = targetAngle - currentAngle;
      needleRef.current.rotation.z += diff * delta * 3; // Smooth damping
    }
  });
  
  return (
    <group>
      <GaugeBezel />
      <GaugeFace 
        label={label}
        unit={unit}
        min={min}
        max={max}
        redZone={redZone}
        yellowZone={yellowZone}
      />
      <GaugeNeedle ref={needleRef} />
    </group>
  );
};

interface VintageGaugeContainerProps extends VintageGaugeProps {
  width?: number;
  height?: number;
}

export const VintageGaugeContainer: React.FC<VintageGaugeContainerProps> = ({
  width = 200,
  height = 200,
  ...gaugeProps
}) => {
  return (
    <Box 
      sx={{ 
        width, 
        height,
        background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%' 
        }}>
          <CircularProgress />
        </Box>
      }>
        <Canvas
          camera={{ position: [0, 0, 2], fov: 50 }}
          gl={{ 
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 2, 10]} />
          
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#ff6b6b" />
          
          <VintageGauge {...gaugeProps} />
          
          <Environment preset="studio" />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </Box>
  );
};

// Specialized gauge components for CRM
export const QuotaGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={150}
    label="QUOTA"
    unit="%"
    redZone={[120, 150]}
    yellowZone={[90, 120]}
  />
);

export const PipelineGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={100}
    label="PIPELINE"
    unit="%"
    redZone={[0, 30]}
    yellowZone={[30, 60]}
  />
);

export const RevenueGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={500}
    label="REVENUE"
    unit="K"
    redZone={[0, 100]}
    yellowZone={[100, 200]}
  />
);

export const WinRateGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={100}
    label="WIN RATE"
    unit="%"
    redZone={[0, 25]}
    yellowZone={[25, 50]}
  />
);

export const ActivityGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={100}
    label="ACTIVITY"
    unit="%"
    redZone={[0, 20]}
    yellowZone={[20, 50]}
  />
);

// Market intelligence gauges
export const MarketShareGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={100}
    label="MARKET SHARE"
    unit="%"
    redZone={[0, 15]}
    yellowZone={[15, 30]}
  />
);

export const OpportunityScoreGauge: React.FC<{ value: number }> = ({ value }) => (
  <VintageGaugeContainer
    value={value}
    min={0}
    max={100}
    label="OPPORTUNITY"
    unit="pts"
    redZone={[0, 30]}
    yellowZone={[30, 70]}
  />
);

export default VintageGaugeContainer;
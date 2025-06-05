import React, { useRef, useState, useEffect } from 'react';
import { Group, CanvasTexture, Mesh } from 'three';
import { Text, Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GaugeNeedle } from './GaugeNeedle';
import { GaugeBezel } from './GaugeBezel';
import { materials } from '../../../materials/luxuryMaterials';
import { useNeedleAnimation } from './hooks/useNeedleAnimation';
import { GaugeConfig } from '../../../utils/gaugeConfig';
import { gaugeFaceShader } from './shaders/gaugeFaceShader';
import * as THREE from 'three';

interface GaugeProps {
  config: GaugeConfig;
  value: number;
  nightMode?: boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

export const Gauge: React.FC<GaugeProps> = ({
  config,
  value,
  nightMode = false,
  onHover,
  onClick,
}) => {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [peaking, setPeaking] = useState(false);
  
  const { needleRef } = useNeedleAnimation({
    targetValue: value,
    minValue: config.min,
    maxValue: config.max,
    onPeak: () => setPeaking(true),
  });
  
  // Create gauge face texture
  const createGaugeFaceTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, nightMode ? '#1a1a1a' : '#0a0a0a');
    gradient.addColorStop(1, nightMode ? '#0a0a0a' : '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw numbers
    ctx.fillStyle = nightMode ? '#ffd700' : '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const numSteps = 11;
    for (let i = 0; i < numSteps; i++) {
      const value = config.min + (config.max - config.min) * (i / (numSteps - 1));
      const angle = -135 + (180 * (i / (numSteps - 1)));
      const rad = (angle * Math.PI) / 180;
      const x = 256 + Math.cos(rad) * 180;
      const y = 256 + Math.sin(rad) * 180;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.fillText(Math.round(value).toString(), 0, 0);
      ctx.restore();
    }
    
    // Label
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = nightMode ? '#ffaa00' : '#aaaaaa';
    ctx.fillText(config.label, 256, 350);
    
    // Unit
    if (config.unit) {
      ctx.font = '16px Arial';
      ctx.fillText(config.unit, 256, 380);
    }
    
    return new CanvasTexture(canvas);
  };
  
  const [faceTexture] = useState(() => createGaugeFaceTexture());
  
  useEffect(() => {
    if (peaking) {
      const timeout = setTimeout(() => setPeaking(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [peaking]);
  
  useFrame((state) => {
    if (glowRef.current && peaking) {
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
      (glowRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = intensity;
    }
  });
  
  return (
    <group
      ref={groupRef}
      position={config.position}
      onPointerOver={() => {
        setHovered(true);
        onHover?.(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover?.(false);
      }}
      onClick={onClick}
    >
      {/* Gauge face background */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.55, 64]} />
        <primitive object={materials.blackDial} attach="material" />
      </mesh>
      
      {/* Gauge face with texture */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshPhysicalMaterial
          map={faceTexture}
          transparent
          metalness={0.1}
          roughness={0.8}
          clearcoat={nightMode ? 0.2 : 0.5}
          clearcoatRoughness={0.3}
        />
      </mesh>
      
      {/* Glass cover */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.48, 64]} />
        <primitive object={materials.sapphireGlass} attach="material" />
      </mesh>
      
      {/* Color zones */}
      <group position={[0, 0, 0.01]}>
        {/* Red zone */}
        <mesh rotation={[0, 0, ((config.redZone[0] / config.max) * 180 - 135) * (Math.PI / 180)]}>
          <ringGeometry
            args={[
              0.42,
              0.45,
              32,
              1,
              0,
              ((config.redZone[1] - config.redZone[0]) / config.max) * Math.PI,
            ]}
          />
          <meshPhysicalMaterial
            color={0xff0000}
            transparent
            opacity={0.3}
            metalness={0}
            roughness={1}
          />
        </mesh>
        
        {/* Yellow zone */}
        <mesh rotation={[0, 0, ((config.yellowZone[0] / config.max) * 180 - 135) * (Math.PI / 180)]}>
          <ringGeometry
            args={[
              0.42,
              0.45,
              32,
              1,
              0,
              ((config.yellowZone[1] - config.yellowZone[0]) / config.max) * Math.PI,
            ]}
          />
          <meshPhysicalMaterial
            color={0xffff00}
            transparent
            opacity={0.3}
            metalness={0}
            roughness={1}
          />
        </mesh>
      </group>
      
      {/* Needle */}
      <GaugeNeedle ref={needleRef} />
      
      {/* Bezel */}
      <GaugeBezel />
      
      {/* Hover glow */}
      <mesh ref={glowRef} visible={hovered || peaking} position={[0, 0, -0.02]}>
        <ringGeometry args={[0.5, 0.6, 64]} />
        <meshPhysicalMaterial
          color={peaking ? 0xff0000 : 0xffd700}
          emissive={peaking ? 0xff0000 : 0xffd700}
          emissiveIntensity={hovered ? 0.3 : 0}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};
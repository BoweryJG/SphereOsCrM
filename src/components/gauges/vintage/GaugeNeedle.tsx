import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { materials } from '../materials/luxuryMaterials';

interface GaugeNeedleProps {
  length?: number;
  width?: number;
}

export const GaugeNeedle = forwardRef<THREE.Group, GaugeNeedleProps>(
  ({ length = 0.35, width = 0.02 }, ref) => {
    const needleShape = new THREE.Shape();
    
    // Create elegant needle shape
    needleShape.moveTo(0, -width / 2);
    needleShape.lineTo(length * 0.7, -width / 2);
    needleShape.quadraticCurveTo(length * 0.85, -width / 2, length * 0.9, -width / 3);
    needleShape.lineTo(length, 0);
    needleShape.lineTo(length * 0.9, width / 3);
    needleShape.quadraticCurveTo(length * 0.85, width / 2, length * 0.7, width / 2);
    needleShape.lineTo(0, width / 2);
    needleShape.quadraticCurveTo(-width, 0, 0, -width / 2);
    
    const extrudeSettings = {
      depth: 0.005,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.001,
      bevelSegments: 4,
    };
    
    return (
      <group ref={ref}>
        {/* Main needle body */}
        <mesh position={[0, 0, 0.02]}>
          <extrudeGeometry args={[needleShape, extrudeSettings]} />
          <primitive object={materials.chrome} attach="material" />
        </mesh>
        
        {/* Red tip */}
        <mesh position={[length * 0.85, 0, 0.022]}>
          <boxGeometry args={[length * 0.15, width * 0.8, 0.008]} />
          <primitive object={materials.redTip} attach="material" />
        </mesh>
        
        {/* Jeweled pivot point */}
        <mesh position={[0, 0, 0.025]}>
          <sphereGeometry args={[width * 0.8, 16, 16]} />
          <primitive object={materials.jewel} attach="material" />
        </mesh>
        
        {/* Counter balance */}
        <mesh position={[-width * 2, 0, 0.02]}>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.01, 16]} />
          <primitive object={materials.chrome} attach="material" />
        </mesh>
      </group>
    );
  }
);
import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { materials } from '../../../materials/luxuryMaterials';

interface GaugeBezelProps {
  radius?: number;
  thickness?: number;
  height?: number;
}

export const GaugeBezel: React.FC<GaugeBezelProps> = ({
  radius = 0.5,
  thickness = 0.05,
  height = 0.08,
}) => {
  // Create knurled texture procedurally
  const createKnurledGeometry = () => {
    const segments = 120;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const knurl = Math.sin(i * 8) * 0.002;
      
      // Outer ring
      vertices.push(
        Math.cos(angle) * (radius + knurl),
        Math.sin(angle) * (radius + knurl),
        0,
        Math.cos(angle) * (radius + knurl),
        Math.sin(angle) * (radius + knurl),
        height
      );
      
      // Inner ring
      vertices.push(
        Math.cos(angle) * (radius - thickness),
        Math.sin(angle) * (radius - thickness),
        0,
        Math.cos(angle) * (radius - thickness),
        Math.sin(angle) * (radius - thickness),
        height
      );
      
      // Normals
      const normal = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
      normals.push(
        normal.x, normal.y, normal.z,
        normal.x, normal.y, normal.z,
        -normal.x, -normal.y, -normal.z,
        -normal.x, -normal.y, -normal.z
      );
      
      // UVs
      const u = i / segments;
      uvs.push(u, 0, u, 1, u, 0, u, 1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    return geometry;
  };
  
  return (
    <group>
      {/* Main bezel ring */}
      <mesh>
        <torusGeometry args={[radius, thickness, 8, segments]} />
        <primitive object={materials.bezelMetal} attach="material" />
      </mesh>
      
      {/* Knurled adjustment ring */}
      <mesh position={[0, 0, -0.02]} rotation={[0, 0, 0]}>
        <primitive object={createKnurledGeometry()} attach="geometry" />
        <primitive object={materials.brushedAluminum} attach="material" />
      </mesh>
      
      {/* Decorative screws */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * (radius + thickness * 0.7);
        const y = Math.sin(rad) * (radius + thickness * 0.7);
        
        return (
          <group key={i} position={[x, y, height / 2]}>
            {/* Screw head */}
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.003, 16]} />
              <primitive object={materials.chrome} attach="material" />
            </mesh>
            {/* Screw slot */}
            <mesh position={[0, 0, 0.0015]}>
              <boxGeometry args={[0.012, 0.002, 0.001]} />
              <meshPhysicalMaterial color={0x000000} metalness={0} roughness={1} />
            </mesh>
          </group>
        );
      })}
      
      {/* Serial number engraving */}
      <mesh position={[0, -radius - thickness * 0.5, height / 2]}>
        <planeGeometry args={[0.1, 0.01]} />
        <meshPhysicalMaterial
          color={0x666666}
          metalness={1}
          roughness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

const segments = 60;
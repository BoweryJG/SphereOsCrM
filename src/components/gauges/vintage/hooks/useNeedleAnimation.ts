import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

interface NeedleAnimationProps {
  targetValue: number;
  minValue: number;
  maxValue: number;
  springConfig?: {
    mass?: number;
    tension?: number;
    friction?: number;
    precision?: number;
  };
  onPeak?: () => void;
}

export const useNeedleAnimation = ({
  targetValue,
  minValue,
  maxValue,
  springConfig = {
    mass: 1,
    tension: 170,
    friction: 26,
    precision: 0.01,
  },
  onPeak,
}: NeedleAnimationProps) => {
  const needleRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(0);
  const currentValueRef = useRef(0);
  const targetRef = useRef(targetValue);
  const vibrateRef = useRef(0);
  
  useEffect(() => {
    targetRef.current = targetValue;
    
    // Check if we're in the red zone
    const percentage = (targetValue - minValue) / (maxValue - minValue);
    if (percentage > 0.8 && onPeak) {
      onPeak();
    }
  }, [targetValue, minValue, maxValue, onPeak]);
  
  useFrame((state) => {
    if (!needleRef.current) return;
    
    const deltaTime = state.clock.getDelta();
    const current = currentValueRef.current;
    const target = targetRef.current;
    
    // Spring physics simulation
    const displacement = target - current;
    const springForce = displacement * springConfig.tension;
    const dampingForce = velocityRef.current * springConfig.friction;
    const acceleration = (springForce - dampingForce) / springConfig.mass;
    
    velocityRef.current += acceleration * deltaTime;
    currentValueRef.current += velocityRef.current * deltaTime;
    
    // Add vibration at high values
    const percentage = (current - minValue) / (maxValue - minValue);
    if (percentage > 0.85) {
      vibrateRef.current = Math.sin(state.clock.elapsedTime * 50) * 0.002 * (percentage - 0.85);
    } else {
      vibrateRef.current *= 0.95;
    }
    
    // Convert to rotation angle
    const normalized = (current - minValue) / (maxValue - minValue);
    const startAngle = -135 * (Math.PI / 180);
    const endAngle = 45 * (Math.PI / 180);
    const angle = startAngle + normalized * (endAngle - startAngle) + vibrateRef.current;
    
    needleRef.current.rotation.z = angle;
  });
  
  return { needleRef };
};

export const useStartupAnimation = (
  gaugeRefs: React.RefObject<THREE.Group>[],
  delays: number[]
) => {
  useEffect(() => {
    gaugeRefs.forEach((ref, index) => {
      if (!ref.current) return;
      
      // Initial state
      gsap.set(ref.current.rotation, { z: -135 * (Math.PI / 180) });
      gsap.set(ref.current.scale, { x: 0.8, y: 0.8, z: 0.8 });
      
      // Startup animation
      gsap.to(ref.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        delay: delays[index],
        ease: 'elastic.out(1, 0.5)',
      });
      
      // Initial needle sweep
      gsap.to(ref.current.rotation, {
        z: 45 * (Math.PI / 180),
        duration: 1.2,
        delay: delays[index] + 0.2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.1,
      });
    });
  }, []);
};
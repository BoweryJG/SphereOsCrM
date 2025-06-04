import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

interface VintageGauge2DProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  redZone?: [number, number];
  yellowZone?: [number, number];
  size?: number;
}

const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '50%',
  background: `
    radial-gradient(circle at 30% 30%, 
      ${alpha('#C9B037', 0.1)} 0%, 
      ${alpha('#1a1a1a', 0.9)} 40%, 
      #0f0f0f 100%
    )
  `,
  border: '3px solid #C9B037',
  boxShadow: `
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    inset 0 0 40px rgba(201, 176, 55, 0.1),
    0 0 20px rgba(201, 176, 55, 0.3)
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(201, 176, 55, 0.3)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '70%',
    height: '70%',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(201, 176, 55, 0.2)',
  }
}));

const VintageGauge2D: React.FC<VintageGauge2DProps> = ({
  value,
  min,
  max,
  label,
  unit = '',
  redZone,
  yellowZone,
  size = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState(min);
  
  useEffect(() => {
    // Animate value change
    const animationDuration = 1000; // ms
    const startTime = Date.now();
    const startValue = currentValue;
    const deltaValue = value - startValue;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const easedProgress = easeInOutQuad(progress);
      
      const newValue = startValue + deltaValue * easedProgress;
      setCurrentValue(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = size * 2; // For retina
    canvas.height = size * 2;
    ctx.scale(2, 2); // Scale for retina
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const startAngle = (135 * Math.PI) / 180;
    const endAngle = (45 * Math.PI) / 180;
    const angleRange = (270 * Math.PI) / 180;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw dial background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    
    // Draw color zones
    const drawZone = (start: number, end: number, color: string, alpha: number = 0.3) => {
      const startNorm = (start - min) / (max - min);
      const endNorm = (end - min) / (max - min);
      const zoneStartAngle = startAngle + startNorm * angleRange;
      const zoneEndAngle = startAngle + endNorm * angleRange;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.85, zoneStartAngle, zoneEndAngle);
      ctx.arc(centerX, centerY, radius * 0.75, zoneEndAngle, zoneStartAngle, true);
      ctx.closePath();
      ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    };
    
    if (redZone) {
      drawZone(redZone[0], redZone[1], '#ff0000');
    }
    
    if (yellowZone) {
      drawZone(yellowZone[0], yellowZone[1], '#ffff00', 0.2);
    }
    
    // Draw tick marks
    const tickCount = 10;
    for (let i = 0; i <= tickCount; i++) {
      const tickAngle = startAngle + (i / tickCount) * angleRange;
      const isMainTick = i % 2 === 0;
      const tickLength = isMainTick ? 0.1 : 0.05;
      
      const innerRadius = radius * (1 - tickLength);
      const outerRadius = radius;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(tickAngle) * innerRadius,
        centerY + Math.sin(tickAngle) * innerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(tickAngle) * outerRadius,
        centerY + Math.sin(tickAngle) * outerRadius
      );
      ctx.strokeStyle = '#C9B037';
      ctx.lineWidth = isMainTick ? 2 : 1;
      ctx.stroke();
      
      // Draw numbers for main ticks
      if (isMainTick) {
        const tickValue = min + (i / tickCount) * (max - min);
        const textRadius = radius * 0.65;
        const textX = centerX + Math.cos(tickAngle) * textRadius;
        const textY = centerY + Math.sin(tickAngle) * textRadius;
        
        ctx.save();
        ctx.fillStyle = '#C9B037';
        ctx.font = `bold ${size * 0.06}px "Orbitron", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tickValue.toString(), textX, textY);
        ctx.restore();
      }
    }
    
    // Draw needle
    const valueNorm = (currentValue - min) / (max - min);
    const needleAngle = startAngle + valueNorm * angleRange;
    
    // Needle shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Main needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * radius * 0.85,
      centerY + Math.sin(needleAngle) * radius * 0.85
    );
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    
    // Red needle tip
    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(needleAngle) * radius * 0.7,
      centerY + Math.sin(needleAngle) * radius * 0.7
    );
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * radius * 0.85,
      centerY + Math.sin(needleAngle) * radius * 0.85
    );
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center jewel
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.03, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.03);
    gradient.addColorStop(0, '#ff6666');
    gradient.addColorStop(0.5, '#ff0000');
    gradient.addColorStop(1, '#990000');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#C9B037';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw label
    ctx.fillStyle = '#C9B037';
    ctx.font = `bold ${size * 0.07}px "Orbitron", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, centerY + radius * 0.4);
    
    // Draw value
    ctx.font = `bold ${size * 0.1}px "Orbitron", monospace`;
    ctx.fillText(`${currentValue.toFixed(1)}${unit}`, centerX, centerY + radius * 0.6);
    
  }, [currentValue, min, max, label, unit, redZone, yellowZone, size]);
  
  return (
    <GaugeContainer
      sx={{
        width: size,
        height: size,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Decorative screws */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const screwDistance = size * 0.47;
        const x = 50 + Math.cos(rad) * (47);
        const y = 50 + Math.sin(rad) * (47);
        
        return (
          <Box
            key={angle}
            sx={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size * 0.04,
              height: size * 0.04,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #E8E8E8 0%, #C9B037 50%, #8B7A3D 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 2px rgba(201, 176, 55, 0.5)',
              transform: 'translate(-50%, -50%)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: '20%',
                background: '#000',
                transform: 'translateY(-50%)',
              }
            }}
          />
        );
      })}
    </GaugeContainer>
  );
};

// Specialized gauge components for CRM
export const QuotaGauge2D: React.FC<{ value: number; size?: number }> = ({ value, size }) => (
  <VintageGauge2D
    value={value}
    min={0}
    max={150}
    label="QUOTA"
    unit="%"
    redZone={[120, 150]}
    yellowZone={[90, 120]}
    size={size}
  />
);

export const PipelineGauge2D: React.FC<{ value: number; size?: number }> = ({ value, size }) => (
  <VintageGauge2D
    value={value}
    min={0}
    max={100}
    label="PIPELINE"
    unit="%"
    redZone={[0, 30]}
    yellowZone={[30, 60]}
    size={size}
  />
);

export const RevenueGauge2D: React.FC<{ value: number; size?: number }> = ({ value, size }) => (
  <VintageGauge2D
    value={value}
    min={0}
    max={500}
    label="REVENUE"
    unit="K"
    redZone={[0, 100]}
    yellowZone={[100, 200]}
    size={size}
  />
);

export const WinRateGauge2D: React.FC<{ value: number; size?: number }> = ({ value, size }) => (
  <VintageGauge2D
    value={value}
    min={0}
    max={100}
    label="WIN RATE"
    unit="%"
    redZone={[0, 25]}
    yellowZone={[25, 50]}
    size={size}
  />
);

export const ActivityGauge2D: React.FC<{ value: number; size?: number }> = ({ value, size }) => (
  <VintageGauge2D
    value={value}
    min={0}
    max={100}
    label="ACTIVITY"
    unit="%"
    redZone={[0, 20]}
    yellowZone={[20, 50]}
    size={size}
  />
);

export default VintageGauge2D;
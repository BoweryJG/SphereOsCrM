export interface GaugeConfig {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  redZone: [number, number];
  yellowZone: [number, number];
  position: [number, number, number];
  initialValue: number;
}

export const gaugeConfigs: GaugeConfig[] = [
  {
    id: 'quota',
    label: 'QUOTA',
    unit: '%',
    min: 0,
    max: 150,
    redZone: [120, 150],
    yellowZone: [90, 120],
    position: [-2.5, 1.2, 0],
    initialValue: 0,
  },
  {
    id: 'pipeline',
    label: 'PIPELINE HEALTH',
    unit: '%',
    min: 0,
    max: 100,
    redZone: [0, 30],
    yellowZone: [30, 60],
    position: [-1.25, 0, 0],
    initialValue: 0,
  },
  {
    id: 'revenue',
    label: 'REVENUE',
    unit: 'K/mo',
    min: 0,
    max: 500,
    redZone: [0, 100],
    yellowZone: [100, 200],
    position: [0, -1.2, 0],
    initialValue: 0,
  },
  {
    id: 'activity',
    label: 'ACTIVITY SCORE',
    unit: '',
    min: 0,
    max: 100,
    redZone: [0, 20],
    yellowZone: [20, 50],
    position: [1.25, 0, 0],
    initialValue: 0,
  },
  {
    id: 'winrate',
    label: 'WIN RATE',
    unit: '%',
    min: 0,
    max: 100,
    redZone: [0, 25],
    yellowZone: [25, 50],
    position: [2.5, 1.2, 0],
    initialValue: 0,
  },
];

export const getGaugeAngle = (value: number, min: number, max: number): number => {
  const normalized = (value - min) / (max - min);
  const startAngle = -135;
  const endAngle = 45;
  return (startAngle + normalized * (endAngle - startAngle)) * (Math.PI / 180);
};
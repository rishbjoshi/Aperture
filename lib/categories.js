export const CATS = [
  { name: 'Landscape', icon: '🏔️' },
  { name: 'Portrait', icon: '🧑' },
  { name: 'Street', icon: '🏙️' },
  { name: 'Wildlife', icon: '🦊' },
  { name: 'Macro', icon: '🔬' },
  { name: 'Architecture', icon: '🏛️' },
];
export const iconFor = (name) => CATS.find((c) => c.name === name)?.icon || '📷';

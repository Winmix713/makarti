export type GradientPreset = {
  name: string;
  stops: {color: string;position: number;}[];
  angle?: number;
};

export const gradientPresets: GradientPreset[] = [
{
  name: 'Sunset',
  angle: 135,
  stops: [
  { color: '#f59e0b', position: 0 },
  { color: '#ec4899', position: 50 },
  { color: '#8b5cf6', position: 100 }]

},
{
  name: 'Ocean',
  angle: 180,
  stops: [
  { color: '#0ea5e9', position: 0 },
  { color: '#3b82f6', position: 50 },
  { color: '#1d4ed8', position: 100 }]

},
{
  name: 'Forest',
  angle: 45,
  stops: [
  { color: '#84cc16', position: 0 },
  { color: '#22c55e', position: 100 }]

},
{
  name: 'Midnight',
  angle: 120,
  stops: [
  { color: '#312e81', position: 0 },
  { color: '#4c1d95', position: 100 }]

},
{
  name: 'Candy',
  angle: 90,
  stops: [
  { color: '#f472b6', position: 0 },
  { color: '#c084fc', position: 50 },
  { color: '#818cf8', position: 100 }]

},
{
  name: 'Fire',
  angle: 0,
  stops: [
  { color: '#ef4444', position: 0 },
  { color: '#f97316', position: 100 }]

},
{
  name: 'Beam',
  angle: 135,
  stops: [
  { color: '#ffffff', position: 0 },
  { color: '#e2e8f0', position: 50 },
  { color: '#94a3b8', position: 100 }]

},
{
  name: 'Darkness',
  angle: 180,
  stops: [
  { color: '#18181b', position: 0 },
  { color: '#000000', position: 100 }]

}];
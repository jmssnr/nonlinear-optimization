export const chartColors = {
  violet: { fill: "fill-violet-900", stroke: "stroke-violet-500" },
  amber: { fill: "fill-amber-900", stroke: "stroke-amber-500" },
  pink: { fill: "fill-pink-900", stroke: "stroke-pink-500" },
  blue: { fill: "fill-blue-900", stroke: "stroke-blue-500" },
} as const;

export type ChartColor = keyof typeof chartColors;

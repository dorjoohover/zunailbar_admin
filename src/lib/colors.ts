export const COLOR_HEX = {
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
  yellow: "#EAB308",
  purple: "#A855F7",
  pink: "#EC4899",
  // indigo: "#6366F1",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  sky: "#0EA5E9",
  rose: "#F43F5E",
  orange: "#F97316",
  amber: "#F59E0B",
  lime: "#84CC16",
  emerald: "#10B981",
  violet: "#8B5CF6",
  fuchsia: "#D946EF",
  slate: "#64748B",
  stone: "#78716C",
} as const;
export type ColorName = keyof typeof COLOR_HEX;

export const COLORS: ColorName[] = Object.keys(COLOR_HEX) as ColorName[];
export const getUserColor = (index: number) => {
  return COLORS[index];
};
// Нэмэлт сүүдэр сетүүд (1 өнгөнд 3 хувилбар = 60+ item)
const SHADE_SETS = [
  { bg: 500, border: 200, text: 800 },
  // { bg: 400, border: 200, text: 800 },
  // { bg: 500, border: 300, text: 900 },
];

const hash = (s: string) => {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
};

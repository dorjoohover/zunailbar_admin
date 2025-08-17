export const COLORS = [
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
  "pink",
  "indigo",
  "teal",
  "cyan",
  "sky",
  "rose",
  "orange",
  "amber",
  "lime",
  "emerald",
  "violet",
  "fuchsia",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

// Нэмэлт сүүдэр сетүүд (1 өнгөнд 3 хувилбар = 60+ item)
const SHADE_SETS = [
  { bg: 500, border: 200, text: 800 },
  // { bg: 400, border: 200, text: 800 },
  // { bg: 500, border: 300, text: 900 },
];

export const PALETTE = COLORS.flatMap((c) =>
  SHADE_SETS.map((s) => ({
    bg: `bg-${c}-${s.bg}`,
    border: `border-${c}-${s.border}`,
    text: `text-${c}-${s.text}`,
  }))
);

const hash = (s: string) => {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
};

export const getUserColor = (index: number) => {
  return PALETTE[index];
};

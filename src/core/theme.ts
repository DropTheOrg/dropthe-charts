// DropThe Charts -- Theme System
// Pastel risograph aesthetic with film grain on elements
// Brand colors from dt-tokens.css, shifted to pastel

export interface Theme {
  name: string;
  bg: string;
  surface: string;
  grid: string;
  textPrimary: string;
  textSecondary: string;
  textSource: string;
  gradients: string[][];
  highlightGradient: string[];
  lineStroke: string;
  lineFill: [string, string];
  fontFamily: string;
  monoFamily: string;
  grain: number;
  grainTarget: 'all' | 'elements';
}

// Pastel versions of DropThe brand accents
// Original -> Pastel
// tech #3b82f6 -> #93b8fd
// coin #f59e0b -> #fdd08a
// money #22c55e -> #86efac
// culture #ec4899 -> #f9a8d4
// gaming #8b5cf6 -> #c4b5fd
// gear #f97316 -> #fdba74
// health #E63946 -> #fca5a5
// travel #069494 -> #5eead4
// feel-good #4ade80 -> #bbf7d0
// stream #10B981 -> #6ee7b7
// data #007BFF -> #93c5fd

export const midnight: Theme = {
  name: 'midnight',
  bg: '#0a0a0f',
  surface: '#141419',
  grid: '#1a1a22',
  textPrimary: '#f0f0f0',
  textSecondary: '#555566',
  textSource: '#333344',
  gradients: [
    ['#c4b5fd', '#f9a8d4'],  // gaming -> culture
    ['#93b8fd', '#c4b5fd'],  // tech -> gaming
    ['#86efac', '#93b8fd'],  // money -> tech
    ['#fdd08a', '#f9a8d4'],  // coin -> culture
    ['#fdba74', '#fdd08a'],  // gear -> coin
    ['#5eead4', '#86efac'],  // travel -> money
  ],
  highlightGradient: ['#f9a8d4', '#93b8fd'], // culture -> tech
  lineStroke: '#c4b5fd',
  lineFill: ['rgba(196,181,253,0.35)', 'rgba(196,181,253,0)'],
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  monoFamily: "'SF Mono', 'Fira Code', monospace",
  grain: 0.055, // slightly higher for riso effect
  grainTarget: 'elements',
};

export const sand: Theme = {
  name: 'sand',
  bg: '#ebe5d9',
  surface: '#e0dace',
  grid: '#d4cec2',
  textPrimary: '#1a1815',
  textSecondary: '#8a8478',
  textSource: '#b0a89c',
  // Same pastel colors on sand
  gradients: [
    ['#c4b5fd', '#f9a8d4'],
    ['#93b8fd', '#c4b5fd'],
    ['#86efac', '#93b8fd'],
    ['#fdd08a', '#f9a8d4'],
    ['#fdba74', '#fdd08a'],
    ['#5eead4', '#86efac'],
  ],
  highlightGradient: ['#f9a8d4', '#93b8fd'],
  lineStroke: '#c4b5fd',
  lineFill: ['rgba(196,181,253,0.3)', 'rgba(196,181,253,0)'],
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  monoFamily: "'SF Mono', 'Fira Code', monospace",
  grain: 0.055,
  grainTarget: 'elements',
};

export function getTheme(name?: string): Theme {
  if (name === 'sand') return sand;
  return midnight;
}

# DropThe Charts

Data visualization library with lava lamp gradients, risograph film grain, and pastel aesthetics. Built for [DropThe.org](https://dropthe.org).

**16KB.** Zero dependencies. Canvas-based. Dark + Sand themes.

## Features

- **Lava gradients** — radial blob fills that look like ElevenLabs, not Excel
- **Film grain on elements** — risograph texture on bars/lines only, background stays clean
- **Highlight mode** — one bar pops in color, rest fade to glass
- **highlightTop** — `highlightTop: 3` colors top 3, rest glass. Works with any number.
- **Rank badges** — gradient pills for top N on horizontal bars
- **Count-up animation** — values animate from 0 to final
- **Gradient text** — value labels use the bar's gradient colors
- **Values on bar** — numbers inside or above bars
- **Dark + Sand themes** — same pastel colors, two backgrounds
- **Stat cards** — big gradient numbers with delta badges

## Chart Types

- `bar` — vertical bars
- `hbar` — horizontal bars (rankings)
- `line` — time-series with lava area fills
- `stat` — big number cards

## Quick Start

```html
<div id="chart"></div>
<script src="https://dropthe.org/js/dt-charts.min.js"></script>
<script>
DTCharts.create('#chart', {
  type: 'bar',
  title: 'GDP Per Capita (2023)',
  subtitle: 'Top 5 by PPP',
  source: 'World Bank via DropThe',
  highlightTop: 1,
  data: [
    { label: 'Luxembourg', value: 128259 },
    { label: 'Singapore', value: 105689 },
    { label: 'Ireland', value: 104039 },
    { label: 'Qatar', value: 96491 },
    { label: 'Switzerland', value: 87097 }
  ],
  valuePrefix: '$',
  width: 500,
  height: 380
});
</script>
```

## Highlight Modes

```js
// Single item highlighted
data: [{ label: 'NVIDIA', value: 239, highlight: true }, ...]

// Top N highlighted (rest = glass)
highlightTop: 1   // only #1 gets color
highlightTop: 3   // top 3 get color
highlightTop: 10  // all 10 get color

// Rank badges on horizontal bars
showRank: true     // shows #1, #2, #3... pills
```

## Themes

```js
// Dark (default)
DTCharts.create('#el', { type: 'bar', data: [...] })

// Sand
DTCharts.create('#el', { type: 'bar', theme: 'sand', data: [...] })
```

## Brand Colors (Pastel)

| Token | Original | Pastel |
|-------|----------|--------|
| gaming | `#8b5cf6` | `#c4b5fd` |
| tech | `#3b82f6` | `#93b8fd` |
| money | `#22c55e` | `#86efac` |
| culture | `#ec4899` | `#f9a8d4` |
| coin | `#f59e0b` | `#fdd08a` |
| gear | `#f97316` | `#fdba74` |
| travel | `#069494` | `#5eead4` |

## License

MIT — [DropThe.org](https://dropthe.org)

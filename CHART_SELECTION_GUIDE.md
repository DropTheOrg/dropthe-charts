# DropThe Charts -- Selection Guide

**20 chart types. Pick the right one in 10 seconds.**

When writing an article, ask: "What am I trying to show?" Then match below.

---

## Decision Tree

### "I want to COMPARE things"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| Ranked values (top 10, best/worst) | **Bar** | `bar` |
| Ranked values with long labels | **Horizontal Bar** | `hbar` |
| Rankings with many items (10+), clean look | **Lollipop** | `lollipop` |
| Entity vs entity across 4-8 dimensions | **Radar** | `radar` |
| Before/after comparison (2 time points) | **Slope** | `slope` |
| Grid of values (availability, coverage) | **Heatmap** | `heatmap` |

### "I want to show PROPORTIONS / PART-TO-WHOLE"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| Market share, 2-7 segments | **Donut** | `donut` |
| Single score or rating (0-100) | **Gauge** | `donut` (gauge: true) |
| Proportions that feel tangible ("7 in 10") | **Waffle** | `waffle` |
| Hierarchical breakdown (sector > company) | **Treemap** | `treemap` |
| Composition across categories | **Stacked Bar** | `stacked-bar` |
| Sequential drop-off / conversion pipeline | **Funnel** | `funnel` |

### "I want to show CHANGE OVER TIME"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| Trend line, growth curve | **Line** | `line` |
| Volume/magnitude over time | **Area** | `area` |
| Stacked volume over time | **Area** (stacked) | `area` (stacked: true) |
| How rankings shifted over time | **Bump** | `bump` |
| Financial OHLC data | **Candlestick** | `candlestick` |

### "I want to show CORRELATION / RELATIONSHIP"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| Two numeric variables per entity | **Scatter** | `scatter` |
| Three dimensions (x, y, size) | **Bubble** | `bubble` |
| Flow between categories | **Sankey** | `sankey` |

### "I want to show DISTRIBUTION"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| How values are spread across ranges | **Histogram** | `histogram` |

### "I want to highlight a SINGLE NUMBER"
| What exactly? | Chart | Type Code |
|---------------|-------|-----------|
| Hero metric, big callout | **Stat Card** | `stat` |

---

## Quick Reference Table

| # | Type | Code | Category | Best For | Data Format |
|---|------|------|----------|----------|-------------|
| 1 | Bar | `bar` | Comparison | Rankings, top-N | `[{label, value, highlight?}]` |
| 2 | Horizontal Bar | `hbar` | Comparison | Leaderboards | `[{label, value, highlight?}]` |
| 3 | Line | `line` | Temporal | Trends over time | `[{label, data: [{x, y}]}]` |
| 4 | Stat Card | `stat` | Highlight | Single hero number | `{value, label, sublabel}` |
| 5 | Radar | `radar` | Comparison | Multi-dimension entity compare | `{axes: [], datasets: [{label, values: []}]}` |
| 6 | Donut | `donut` | Part-to-whole | Market share, proportions | `[{label, value, highlight?}]` |
| 7 | Gauge | `donut` | Part-to-whole | Scores, ratings (0-100) | `gauge: true, gaugeValue: N` |
| 8 | Heatmap | `heatmap` | Comparison | Matrices, availability grids | `{rows: [], cols: [], values: [[]]}` |
| 9 | Bump | `bump` | Temporal | Ranking changes over time | `[{label, ranks: []}]` |
| 10 | Scatter | `scatter` | Correlation | Two-variable relationship | `[{x, y, label?, size?, highlight?}]` |
| 11 | Bubble | `bubble` | Correlation | Three-variable relationship | `[{x, y, z, label?, highlight?}]` |
| 12 | Waffle | `waffle` | Part-to-whole | Tangible proportions | `[{label, value, highlight?}]` |
| 13 | Treemap | `treemap` | Part-to-whole | Hierarchical sizes | `[{label, value, highlight?}]` |
| 14 | Stacked Bar | `stacked-bar` | Part-to-whole | Composition per category | `{categories: [], series: [{label, values: []}]}` |
| 15 | Candlestick | `candlestick` | Temporal | OHLC financial data | `[{label, open, high, low, close}]` |
| 16 | Funnel | `funnel` | Part-to-whole | Conversion, pipeline stages | `[{label, value, highlight?}]` |
| 17 | Lollipop | `lollipop` | Comparison | Clean rankings, many items | `[{label, value, highlight?}]` |
| 18 | Area | `area` | Temporal | Volume over time | `[{label, data: [{x, y}]}]` |
| 19 | Sankey | `sankey` | Relationship | Flow between categories | `{nodes: [{label}], links: [{source, target, value}]}` |
| 20 | Histogram | `histogram` | Distribution | Value distribution | `number[]` (raw values) |
| 21 | Slope | `slope` | Comparison | Before/after comparison | `[{label, start, end, highlight?}]` |

---

## Pipeline Integration

When the article pipeline generates a chart, it should:

1. **Read the article thesis** -- what story are we telling?
2. **Match to decision tree above** -- what type of comparison/relationship?
3. **Pick the chart type** -- use the type code
4. **Format the data** -- use the data format from the quick reference
5. **Set highlight** -- the entity or point that IS the story gets `highlight: true`
6. **Choose theme** -- `midnight` for dark articles, `sand` for light

### Auto-Selection Rules for Pipeline

```
IF article compares rankings → bar or hbar (< 8 items = bar, >= 8 = hbar)
IF article shows market share → donut (< 8 segments) or treemap (>= 8)
IF article tracks change over time → line (1-2 series) or area (3+ series)
IF article shows "X vs Y across dimensions" → radar
IF article shows score or rating → gauge (donut with gauge:true)
IF article shows correlation → scatter (2 vars) or bubble (3 vars)
IF article shows ranking changes → bump
IF article shows conversion/pipeline → funnel
IF article is financial/crypto → candlestick
IF article shows distribution → histogram
IF article shows before/after → slope
IF article shows flow/relationships → sankey
IF article highlights one big number → stat
DEFAULT → bar (safest choice)
```

---

## Article Integration Pattern

Every article with a chart should include:
1. The chart itself (rendered via DTCharts.create)
2. A "How to read this chart" link → `/charts/{type}/`
3. Source attribution (baked into canvas watermark)
4. The data context (what the numbers mean, written in prose BEFORE the chart)

Charts are NOT decoration. Every chart must advance the article's argument.

var DTCharts = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    BarChart: () => BarChart,
    HBarChart: () => HBarChart,
    LineChart: () => LineChart,
    StatCard: () => StatCard,
    create: () => create,
    getTheme: () => getTheme,
    init: () => init,
    midnight: () => midnight,
    sand: () => sand
  });

  // src/core/theme.ts
  var midnight = {
    name: "midnight",
    bg: "#0a0a0f",
    surface: "#141419",
    grid: "#1a1a22",
    textPrimary: "#f0f0f0",
    textSecondary: "#555566",
    textSource: "#333344",
    gradients: [
      ["#8b5cf6", "#ec4899"],
      ["#3b82f6", "#8b5cf6"],
      ["#10b981", "#3b82f6"],
      ["#f59e0b", "#ec4899"],
      ["#ef4444", "#f59e0b"],
      ["#6366f1", "#10b981"]
    ],
    highlightGradient: ["#ec4899", "#3b82f6"],
    lineStroke: "#8b5cf6",
    lineFill: ["rgba(139,92,246,0.3)", "rgba(139,92,246,0)"],
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    monoFamily: "'SF Mono', 'Fira Code', monospace",
    grain: 0.04
  };
  var sand = {
    name: "sand",
    bg: "#f5f0e8",
    surface: "#ebe5d9",
    grid: "#d9d3c7",
    textPrimary: "#1a1815",
    textSecondary: "#8a8478",
    textSource: "#b0a89c",
    gradients: [
      ["#c4956a", "#a0522d"],
      ["#8b6f4e", "#6b4f3a"],
      ["#a07850", "#7c5a3c"],
      ["#b8860b", "#8b6914"],
      ["#9c6644", "#704428"],
      ["#a68b5b", "#7c6840"]
    ],
    highlightGradient: ["#c4956a", "#7c4d2a"],
    lineStroke: "#8b6f4e",
    lineFill: ["rgba(139,111,78,0.2)", "rgba(139,111,78,0)"],
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    monoFamily: "'SF Mono', 'Fira Code', monospace",
    grain: 0.035
  };
  function getTheme(name) {
    if (name === "sand") return sand;
    return midnight;
  }

  // src/core/Chart.ts
  var BaseChart = class {
    canvas;
    ctx;
    config;
    theme;
    width;
    height;
    dpr;
    padding;
    animProgress = 0;
    animFrame = 0;
    constructor(container, config) {
      const el = typeof container === "string" ? document.querySelector(container) : container;
      if (!el) throw new Error("DropThe Charts: container not found");
      this.config = config;
      this.theme = getTheme(config.theme);
      this.dpr = window.devicePixelRatio || 1;
      this.width = config.width || el.clientWidth || 600;
      this.height = config.height || 400;
      this.padding = { top: 60, right: 24, bottom: 48, left: 24 };
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
      this.canvas.style.borderRadius = "12px";
      el.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.ctx.scale(this.dpr, this.dpr);
    }
    // Film grain noise overlay
    drawGrain() {
      const { ctx, width, height, theme } = this;
      const imageData = ctx.getImageData(0, 0, width * this.dpr, height * this.dpr);
      const data = imageData.data;
      const alpha = Math.floor(theme.grain * 255);
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 50;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    }
    drawBackground() {
      const { ctx, width, height, theme } = this;
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
    }
    drawTitle() {
      const { ctx, config, theme, padding } = this;
      if (!config.title) return;
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `600 18px ${theme.fontFamily}`;
      ctx.textAlign = "left";
      ctx.fillText(config.title, padding.left, 32);
      if (config.subtitle) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 13px ${theme.fontFamily}`;
        ctx.fillText(config.subtitle, padding.left, 50);
      }
    }
    drawSource() {
      const { ctx, config, theme, width, height } = this;
      const source = config.source || "DropThe";
      const text = `Source: ${source} | dropthe.org`;
      ctx.fillStyle = theme.textSource;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = "left";
      ctx.fillText(text, this.padding.left, height - 12);
    }
    createGradient(x, y1, y2, colors) {
      const grad = this.ctx.createLinearGradient(x, y1, x, y2);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      return grad;
    }
    // Animate with easeOutCubic
    animate(drawFn, duration = 800) {
      if (this.config.animate === false) {
        drawFn(1);
        this.drawGrain();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        this.animProgress = ease;
        drawFn(ease);
        if (t < 1) {
          this.animFrame = requestAnimationFrame(step);
        } else {
          this.drawGrain();
        }
      };
      this.animFrame = requestAnimationFrame(step);
    }
    destroy() {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      this.canvas.remove();
    }
    // Export as PNG data URL
    toPNG() {
      return this.canvas.toDataURL("image/png");
    }
  };

  // src/charts/BarChart.ts
  var BarChart = class extends BaseChart {
    barConfig;
    constructor(container, config) {
      super(container, config);
      this.barConfig = { showValues: true, barRadius: 6, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, barConfig } = this;
      const { data, valuePrefix = "", valueSuffix = "", showValues, barRadius } = barConfig;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 8;
      const chartBottom = height - padding.bottom - 20;
      const chartLeft = padding.left;
      const chartRight = width - padding.right;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;
      const barCount = data.length;
      const barGap = Math.max(12, chartWidth * 0.08);
      const totalGaps = (barCount - 1) * barGap;
      const barWidth = Math.min(80, (chartWidth - totalGaps) / barCount);
      const totalBarsWidth = barCount * barWidth + totalGaps;
      const startX = chartLeft + (chartWidth - totalBarsWidth) / 2;
      const maxVal = Math.max(...data.map((d) => d.value));
      const scaleY = chartHeight / (maxVal * 1.15);
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = chartBottom - chartHeight * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
      }
      data.forEach((d, i) => {
        const x = startX + i * (barWidth + barGap);
        const barHeight = d.value * scaleY * progress;
        const y = chartBottom - barHeight;
        const gradColors = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];
        const grad = this.createGradient(x, y, chartBottom, gradColors);
        this.roundedRect(x, y, barWidth, barHeight, barRadius || 6, grad);
        if (showValues && progress > 0.5) {
          const labelAlpha = Math.min(1, (progress - 0.5) * 2);
          ctx.globalAlpha = labelAlpha;
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `600 13px ${theme.fontFamily}`;
          ctx.textAlign = "center";
          const valText = valuePrefix + this.formatNumber(d.value) + valueSuffix;
          ctx.fillText(valText, x + barWidth / 2, y - 10);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 11px ${theme.monoFamily}`;
        ctx.textAlign = "center";
        const maxLabelWidth = barWidth + barGap * 0.6;
        const label = this.truncateLabel(d.label, maxLabelWidth);
        ctx.fillText(label, x + barWidth / 2, chartBottom + 16);
      });
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();
      this.drawSource();
    }
    roundedRect(x, y, w, h, r, fill) {
      const { ctx } = this;
      if (h < r * 2) r = h / 2;
      if (h <= 0) return;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toLocaleString();
    }
    truncateLabel(label, maxWidth) {
      const { ctx, theme } = this;
      ctx.font = `400 11px ${theme.monoFamily}`;
      if (ctx.measureText(label).width <= maxWidth) return label;
      const parts = label.split(" ");
      if (parts.length > 1) {
        let short = parts[0];
        if (ctx.measureText(short).width <= maxWidth) return short;
      }
      let t = label;
      while (t.length > 3 && ctx.measureText(t + "..").width > maxWidth) {
        t = t.slice(0, -1);
      }
      return t + "..";
    }
  };

  // src/charts/LineChart.ts
  var LineChart = class extends BaseChart {
    lineConfig;
    constructor(container, config) {
      super(container, config);
      this.lineConfig = { showDots: true, showArea: true, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, lineConfig } = this;
      const { data: series, showDots, showArea, yPrefix = "", ySuffix = "" } = lineConfig;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 8;
      const chartBottom = height - padding.bottom - 20;
      const chartLeft = padding.left + 50;
      const chartRight = width - padding.right;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;
      const allY = series.flatMap((s) => s.data.map((d) => d.y));
      const minY = Math.min(...allY) * 0.95;
      const maxY = Math.max(...allY) * 1.05;
      const yRange = maxY - minY || 1;
      const allX = series[0]?.data.map((d) => Number(d.x)) || [];
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const xRange = maxX - minX || 1;
      const yTicks = 5;
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= yTicks; i++) {
        const frac = i / yTicks;
        const y = chartBottom - frac * chartHeight;
        const val = minY + frac * yRange;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 10px ${theme.monoFamily}`;
        ctx.textAlign = "right";
        ctx.fillText(yPrefix + this.formatVal(val) + ySuffix, chartLeft - 8, y + 4);
      }
      const xLabelCount = Math.min(allX.length, 8);
      const xStep = Math.max(1, Math.floor(allX.length / xLabelCount));
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = "center";
      for (let i = 0; i < allX.length; i += xStep) {
        const px = chartLeft + (allX[i] - minX) / xRange * chartWidth;
        ctx.fillText(String(allX[i]), px, chartBottom + 16);
      }
      series.forEach((s, si) => {
        const color = s.color || theme.gradients[si % theme.gradients.length][0];
        const points = [];
        s.data.forEach((d) => {
          const px = chartLeft + (Number(d.x) - minX) / xRange * chartWidth;
          const py = chartBottom - (d.y - minY) / yRange * chartHeight;
          points.push([px, py]);
        });
        const visibleCount = Math.max(1, Math.floor(points.length * progress));
        const visible = points.slice(0, visibleCount);
        if (showArea && visible.length > 1) {
          const gradColors = theme.gradients[si % theme.gradients.length];
          const areaGrad = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
          areaGrad.addColorStop(0, gradColors[0] + "40");
          areaGrad.addColorStop(1, gradColors[1] + "00");
          ctx.beginPath();
          ctx.moveTo(visible[0][0], chartBottom);
          visible.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(visible[visible.length - 1][0], chartBottom);
          ctx.closePath();
          ctx.fillStyle = areaGrad;
          ctx.fill();
        }
        if (visible.length > 1) {
          ctx.beginPath();
          ctx.moveTo(visible[0][0], visible[0][1]);
          for (let i = 1; i < visible.length; i++) {
            ctx.lineTo(visible[i][0], visible[i][1]);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.stroke();
        }
        if (showDots && progress > 0.8) {
          const dotAlpha = (progress - 0.8) * 5;
          ctx.globalAlpha = dotAlpha;
          visible.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = theme.bg;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }
      });
      if (series.length > 1) {
        let legendX = chartLeft;
        const legendY = chartBottom + 32;
        series.forEach((s, si) => {
          const color = s.color || theme.gradients[si % theme.gradients.length][0];
          ctx.fillStyle = color;
          ctx.fillRect(legendX, legendY - 4, 12, 3);
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `400 10px ${theme.monoFamily}`;
          ctx.textAlign = "left";
          ctx.fillText(s.label, legendX + 16, legendY);
          legendX += ctx.measureText(s.label).width + 32;
        });
      }
      ctx.strokeStyle = theme.textSecondary + "40";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();
      this.drawSource();
    }
    formatVal(n) {
      if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + "T";
      if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toFixed(0);
    }
  };

  // src/charts/HBarChart.ts
  var HBarChart = class extends BaseChart {
    hbarConfig;
    constructor(container, config) {
      const barH = config.barHeight || 36;
      const autoHeight = Math.max(300, config.data.length * (barH + 8) + 100);
      config.height = config.height || autoHeight;
      super(container, config);
      this.hbarConfig = { barHeight: barH, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, hbarConfig } = this;
      const { data, valuePrefix = "", valueSuffix = "", barHeight = 36 } = hbarConfig;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 8;
      const labelWidth = 120;
      const chartLeft = padding.left + labelWidth;
      const chartRight = width - padding.right - 60;
      const chartWidth = chartRight - chartLeft;
      const barGap = 8;
      const maxVal = Math.max(...data.map((d) => d.value));
      data.forEach((d, i) => {
        const y = chartTop + i * (barHeight + barGap);
        const barW = d.value / maxVal * chartWidth * progress;
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 12px ${theme.fontFamily}`;
        ctx.textAlign = "right";
        ctx.fillText(d.label, chartLeft - 12, y + barHeight / 2 + 4);
        const gradColors = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];
        const grad = ctx.createLinearGradient(chartLeft, y, chartLeft + barW, y);
        grad.addColorStop(0, gradColors[0]);
        grad.addColorStop(1, gradColors[1]);
        const r = Math.min(4, barW / 2);
        if (barW > 0) {
          ctx.beginPath();
          ctx.moveTo(chartLeft, y);
          ctx.lineTo(chartLeft + barW - r, y);
          ctx.quadraticCurveTo(chartLeft + barW, y, chartLeft + barW, y + r);
          ctx.lineTo(chartLeft + barW, y + barHeight - r);
          ctx.quadraticCurveTo(chartLeft + barW, y + barHeight, chartLeft + barW - r, y + barHeight);
          ctx.lineTo(chartLeft, y + barHeight);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }
        if (progress > 0.5) {
          const alpha = (progress - 0.5) * 2;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `600 12px ${theme.fontFamily}`;
          ctx.textAlign = "left";
          const valText = valuePrefix + this.formatNumber(d.value) + valueSuffix;
          ctx.fillText(valText, chartLeft + barW + 8, y + barHeight / 2 + 4);
          ctx.globalAlpha = 1;
        }
      });
      this.drawSource();
    }
    formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toLocaleString();
    }
  };

  // src/charts/StatCard.ts
  var StatCard = class extends BaseChart {
    statConfig;
    constructor(container, config) {
      config.height = config.height || 200;
      super(container, config);
      this.statConfig = config;
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress), 600);
    }
    draw(progress) {
      const { ctx, width, height, theme, statConfig } = this;
      const { value, label, delta, deltaPositive, prefix = "", suffix = "" } = statConfig.data;
      this.drawBackground();
      const numericVal = typeof value === "number" ? value : parseFloat(String(value));
      let displayVal;
      if (!isNaN(numericVal) && typeof value === "number") {
        const current = numericVal * progress;
        displayVal = prefix + this.formatBigNumber(current) + suffix;
      } else {
        displayVal = prefix + String(value) + suffix;
      }
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `700 48px ${theme.fontFamily}`;
      ctx.textAlign = "center";
      ctx.fillText(displayVal, width / 2, height / 2 - 5);
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 14px ${theme.fontFamily}`;
      ctx.fillText(label, width / 2, height / 2 + 25);
      if (delta && progress > 0.7) {
        const alpha = (progress - 0.7) * 3.3;
        ctx.globalAlpha = Math.min(1, alpha);
        const isPos = deltaPositive !== void 0 ? deltaPositive : delta.startsWith("+");
        const badgeColor = isPos ? "#10b981" : "#ef4444";
        ctx.fillStyle = badgeColor + "22";
        const deltaWidth = ctx.measureText(delta).width + 16;
        const badgeX = width / 2 - deltaWidth / 2;
        const badgeY = height / 2 + 38;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, deltaWidth, 22, 11);
        ctx.fill();
        ctx.fillStyle = badgeColor;
        ctx.font = `600 11px ${theme.monoFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(delta, width / 2, badgeY + 15);
        ctx.globalAlpha = 1;
      }
      if (this.config.title) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 11px ${theme.monoFamily}`;
        ctx.textAlign = "left";
        ctx.fillText(this.config.title.toUpperCase(), this.padding.left, 24);
      }
      this.drawSource();
    }
    formatBigNumber(n) {
      if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return Math.round(n).toLocaleString();
    }
  };

  // src/index.ts
  function create(container, config) {
    switch (config.type) {
      case "bar":
        return new BarChart(container, config);
      case "line":
        return new LineChart(container, config);
      case "hbar":
        return new HBarChart(container, config);
      case "stat":
        return new StatCard(container, config);
      default:
        console.error("DropThe Charts: unknown type", config.type);
    }
  }
  function init() {
    document.querySelectorAll("[data-dt-chart]").forEach((el) => {
      try {
        const config = JSON.parse(el.getAttribute("data-dt-chart") || "{}");
        create(el, config);
      } catch (e) {
        console.error("DropThe Charts: invalid config", e);
      }
    });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=dt-charts.js.map

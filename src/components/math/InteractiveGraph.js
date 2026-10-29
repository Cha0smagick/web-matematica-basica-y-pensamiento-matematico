// InteractiveGraph - Wrapper para function-plot con controles interactivos
import * as functionPlot from 'function-plot';

export class InteractiveGraph extends HTMLElement {
  static get observedAttributes() {
    return ['config', 'width', 'height', 'grid', 'axes', 'zoom', 'pan', 'derivative', 'integral', 'params'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._plot = null;
    this._config = {};
    this._params = {};
    this._derivedConfig = null;
  }

  connectedCallback() {
    this.render();
    this._initPlot();
  }

  disconnectedCallback() {
    if (this._plot) {
      this._plot = null;
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this._plot) {
      switch (name) {
        case 'config':
          this._config = JSON.parse(newVal || '{}');
          this._updatePlot();
          break;
        case 'params':
          this._params = JSON.parse(newVal || '{}');
          this._updatePlot();
          break;
        case 'grid':
        case 'axes':
        case 'zoom':
        case 'pan':
        case 'derivative':
        case 'integral':
          this._updatePlot();
          break;
      }
    }
  }

  set config(config) {
    this._config = config;
    this.setAttribute('config', JSON.stringify(config));
  }

  set params(params) {
    this._params = params;
    this.setAttribute('params', JSON.stringify(params));
  }

  _initPlot() {
    const container = this.shadowRoot.getElementById('plot');
    if (!container) return;

    const defaultConfig = {
      target: container,
      width: parseInt(this.getAttribute('width')) || 500,
      height: parseInt(this.getAttribute('height')) || 350,
      grid: this.hasAttribute('grid') !== false,
      xAxis: { domain: [-5, 5], label: 'x' },
      yAxis: { domain: [-5, 5], label: 'y' },
      disableZoom: !this.hasAttribute('zoom'),
      disablePan: !this.hasAttribute('pan'),
      data: []
    };

    this._config = { ...defaultConfig, ...this._config };
    this._buildData();
    
    try {
      this._plot = functionPlot(this._derivedConfig);
      this._attachInteractions();
    } catch (e) {
      console.error('Function plot error:', e);
      container.innerHTML = `<div class="plot-error">Error al renderizar gráfica: ${e.message}</div>`;
    }
  }

  _buildData() {
    const data = [];
    const params = this._params;
    
    // Función principal
    if (this._config.fn) {
      data.push({
        fn: this._config.fn,
        color: this._config.color || '#2563eb',
        graphType: this._config.graphType || 'polyline',
        nSamples: this._config.nSamples || 500,
        skipTip: false,
        derivative: this.hasAttribute('derivative') ? { fn: this._config.derivativeFn || this._derive(this._config.fn) } : undefined,
        integral: this.hasAttribute('integral') ? { fn: this._config.integralFn || this._integrate(this._config.fn) } : undefined
      });
    }

    // Funciones adicionales
    if (this._config.data) {
      this._config.data.forEach((d, i) => {
        data.push({
          fn: d.fn,
          color: d.color || this._getColor(i + 1),
          graphType: d.graphType || 'polyline',
          derivative: d.derivative,
          integral: d.integral
        });
      });
    }

    // Puntos especiales
    if (this._config.points) {
      this._config.points.forEach(p => {
        data.push({
          points: p.points || [{ x: p.x, y: p.y }],
          fnType: 'points',
          color: p.color || '#ef4444',
          radius: p.radius || 6,
          type: p.type || 'circle'
        });
      });
    }

    // Secantes/Tangentes animadas
    if (this._config.secant) {
      data.push({
        fn: this._config.secant.fn,
        color: this._config.secant.color || '#f59e0b',
        graphType: 'polyline',
        nSamples: 2
      });
    }

    this._derivedConfig = {
      ...this._config,
      data
    };
  }

  _updatePlot() {
    if (!this._plot) return;
    this._buildData();
    try {
      this._plot = functionPlot(this._derivedConfig);
      this._attachInteractions();
    } catch (e) {
      console.error('Plot update error:', e);
    }
  }

  _attachInteractions() {
    const container = this.shadowRoot.getElementById('plot');
    if (!container || !this._plot) return;

    // Tooltip en hover
    let tip = null;
    container.addEventListener('mousemove', (e) => {
      if (!this._plot || !this._plot.derived) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Convert to data coordinates
      const { xScale, yScale } = this._plot.derived;
      if (!xScale || !yScale) return;
      
      const dataX = xScale.invert(x);
      const dataY = yScale.invert(y);
      
      // Find closest point on main function
      if (this._config.fn) {
        try {
          const fn = new Function('x', 'with(Math){ return ' + this._config.fn.replace(/Math\./g, '') + ' }');
          const yVal = fn(dataX);
          
          if (!tip) {
            tip = document.createElement('div');
            tip.className = 'plot-tip';
            tip.style.cssText = `
              position: absolute; pointer-events: none; z-index: 100;
              background: var(--neutral-900); color: white; padding: 6px 10px;
              border-radius: var(--radius-sm); font-size: 12px; font-family: var(--font-mono);
              box-shadow: var(--shadow-lg); transform: translate(-50%, -120%);
            `;
            container.appendChild(tip);
          }
          tip.style.left = x + 'px';
          tip.style.top = y + 'px';
          tip.textContent = `x: ${dataX.toFixed(3)}, y: ${yVal.toFixed(3)}`;
          tip.style.display = 'block';
        } catch {}
      }
    });

    container.addEventListener('mouseleave', () => {
      if (tip) tip.style.display = 'none';
    });

    // Click para punto fijo
    container.addEventListener('click', (e) => {
      if (e.shiftKey) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { xScale, yScale } = this._plot.derived;
      if (xScale && yScale) {
        const dataX = xScale.invert(x);
        const dataY = yScale.invert(y);
        this.dispatchEvent(new CustomEvent('graph-click', {
          detail: { x: dataX, y: dataY, screenX: x, screenY: y },
          bubbles: true, composed: true
        }));
      }
    });
  }

  _derive(fnStr) {
    // Derivada numérica simple para visualización
    return `(x) => {
      const h = 1e-4;
      const f = (x) => { with(Math) { return ${fnStr.replace(/Math\./g, '')} } };
      return (f(x + h) - f(x - h)) / (2 * h);
    }`;
  }

  _integrate(fnStr) {
    // Integral numérica simple (Riemann)
    return `(x) => {
      const f = (x) => { with(Math) { return ${fnStr.replace(/Math\./g, '')} } };
      const a = -5; // límite inferior fijo
      const n = 1000;
      const dx = (x - a) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += f(a + i * dx) * dx;
      }
      return sum;
    }`;
  }

  _getColor(index) {
    const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    return colors[index % colors.length];
  }

  // Métodos públicos
  addFunction(fn, options = {}) {
    if (!this._config.data) this._config.data = [];
    this._config.data.push({ fn, ...options });
    this._updatePlot();
  }

  removeFunction(index) {
    if (this._config.data && this._config.data[index]) {
      this._config.data.splice(index, 1);
      this._updatePlot();
    }
  }

  setDomain(xDomain, yDomain) {
    this._config.xAxis = { ...this._config.xAxis, domain: xDomain };
    this._config.yAxis = { ...this._config.yAxis, domain: yDomain };
    this._updatePlot();
  }

  setParam(name, value) {
    this._params[name] = value;
    this.setAttribute('params', JSON.stringify(this._params));
  }

  exportSVG() {
    const svg = this.shadowRoot.querySelector('svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    }
    return null;
  }

  exportPNG() {
    // Requiere html2canvas o similar
    return Promise.resolve(null);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; }
        #plot { width: 100%; height: 100%; min-height: 300px; }
        .plot-error { padding: var(--spacing-lg); text-align: center; color: var(--error); background: var(--error-light); border-radius: var(--radius-md); }
        .plot-controls { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); flex-wrap: wrap; }
        .plot-controls select, .plot-controls input { padding: var(--spacing-xs) var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); font-size: var(--font-size-sm); }
        .plot-controls button { padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-sm); }
      </style>
      <div id="plot"></div>
    `;
  }
}

if (!customElements.get('interactive-graph')) {
  customElements.define('interactive-graph', InteractiveGraph);
}

// Helper para crear gráficas comunes
export const GraphPresets = {
  linear: (m, b) => ({
    fn: `${m} * x + ${b}`,
    derivativeFn: `${m}`,
    xAxis: { domain: [-10, 10] },
    yAxis: { domain: [-10, 10] }
  }),
  
  quadratic: (a, b, c) => ({
    fn: `${a} * x^2 + ${b} * x + ${c}`,
    derivativeFn: `${2*a} * x + ${b}`,
    xAxis: { domain: [-10, 10] },
    yAxis: { domain: [-10, 10] }
  }),
  
  exponential: (a, b) => ({
    fn: `${a} * exp(${b} * x)`,
    derivativeFn: `${a * b} * exp(${b} * x)`,
    xAxis: { domain: [-5, 5] },
    yAxis: { domain: [0, 50] }
  }),
  
  logarithmic: (a, b) => ({
    fn: `${a} * log(x) + ${b}`,
    derivativeFn: `${a} / x`,
    xAxis: { domain: [0.1, 10] },
    yAxis: { domain: [-10, 10] }
  }),
  
  trigonometric: (fn, amp, freq, phase) => ({
    fn: `${amp} * ${fn}(${freq} * x + ${phase})`,
    xAxis: { domain: [-2*Math.PI, 2*Math.PI] },
    yAxis: { domain: [-amp*1.5, amp*1.5] }
  })
};
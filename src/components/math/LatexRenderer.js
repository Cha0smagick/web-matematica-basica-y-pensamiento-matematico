// LatexRenderer - Render KaTeX con hover explicativo por token
import katex from 'katex';
// El CSS de KaTeX vive a nivel documento Y dentro del shadow root (los estilos del
// documento no atraviesan el shadow boundary)
import 'katex/dist/katex.min.css';
import katexCss from 'katex/dist/katex.min.css?inline';
import glossary from '../../data/glossary.json';

export class LatexRenderer extends HTMLElement {
  static get observedAttributes() {
    return ['latex', 'display-mode', 'interactive', 'size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._latex = '';
    this._displayMode = false;
    this._interactive = true;
    this._size = 'normal';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }
    const targets = {
      latex: '_latex',
      'display-mode': '_displayMode',
      interactive: '_interactive',
      size: '_size',
    };
    const target = targets[name];
    if (!target) {
      return;
    }
    this[target] = name === 'display-mode' || name === 'interactive' ? newVal !== null : newVal;
    this.render();
  }

  get latex() {
    return this._latex;
  }
  set latex(val) {
    this._latex = val;
    this.setAttribute('latex', val);
  }

  get displayMode() {
    return this._displayMode;
  }
  set displayMode(val) {
    this._displayMode = val;
    this.setAttribute('display-mode', val);
  }

  get interactive() {
    return this._interactive;
  }
  set interactive(val) {
    this._interactive = val;
    this.setAttribute('interactive', val);
  }

  render() {
    if (!this._latex) {
      this.shadowRoot.innerHTML = '<span class="latex-empty">(fórmula vacía)</span>';
      return;
    }

    try {
      const html = katex.renderToString(this._latex, {
        displayMode: this._displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        globalGroup: true,
      });

      let processedHtml = html;

      if (this._interactive) {
        processedHtml = this._injectTooltips(html);
      }

      const sizeClass = `latex-${this._size}`;
      const displayClass = this._displayMode ? 'latex-display' : 'latex-inline';

      this.shadowRoot.innerHTML = `
        <style>${katexCss}</style>
        <style>
          :host { display: inline-block; }
          .latex-wrapper { position: relative; }
          .latex-display { display: block; text-align: center; margin: var(--spacing-md) 0; overflow-x: auto; }
          .latex-inline { display: inline; }
          .katex { font-size: var(--math-font-size, 1.1em) !important; }
          .latex-sm .katex { font-size: 0.9em !important; }
          .latex-lg .katex { font-size: 1.3em !important; }
          .latex-xl .katex { font-size: 1.5em !important; }
          .latex-token { cursor: help; position: relative; border-radius: 2px; }
          .latex-token:hover, .latex-token:focus-visible { background: var(--primary-light); }
          [data-theme="dark"] .latex-token:hover { background: var(--primary-900); }
          .latex-token:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
          .latex-token::after {
            content: attr(data-tooltip);
            position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
            background: var(--neutral-900); color: var(--neutral-0);
            padding: 6px 10px; border-radius: 6px;
            font-size: 12px; font-family: var(--font-sans); line-height: 1.4;
            white-space: normal; width: max-content; max-width: 260px;
            opacity: 0; pointer-events: none; transition: opacity var(--transition-fast);
            z-index: var(--z-tooltip, 700); box-shadow: var(--shadow-lg);
          }
          .latex-token:hover::after, .latex-token:focus-visible::after { opacity: 1; }
          .latex-empty { color: var(--text-muted); font-style: italic; font-size: var(--font-size-sm); }
          .katex-error { color: var(--error); font-size: var(--font-size-sm); font-family: var(--font-mono); background: var(--error-light); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); }
        </style>
        <div class="latex-wrapper ${displayClass} ${sizeClass}" role="math" aria-label="Fórmula matemática"${this._displayMode ? ' tabindex="0"' : ''}>${processedHtml}</div>
      `;

      this._attachTokenListeners();
    } catch (e) {
      this.shadowRoot.innerHTML = `<div class="katex-error">Error LaTeX: ${e.message}</div>`;
    }
  }

  _injectTooltips(html) {
    // KaTeX genera spans con clases como .mord, .mop, .mbin, .mrel, .mpunct, .minner, .mopen, .mclose
    // Se anotan los spans existentes (sin envolver, para no romper el layout de KaTeX)
    const tokenRegex =
      /<span class="([^"]*(?:mord|mop|mbin|mrel|mpunct|minner|mopen|mclose)[^"]*)"([^>]*)>([^<]+)<\/span>/g;

    return html.replace(tokenRegex, (match, className, attrs, content) => {
      const token = this._normalizeToken(content);
      const glossaryEntry = glossary[token];

      if (glossaryEntry) {
        const shortDef = this._escapeHtml(glossaryEntry.short || glossaryEntry.definition);
        // Sin tabindex: los tokens viven dentro de .katex-html[aria-hidden] y un foco ahí sería invisible para lectores
        return `<span class="${className} latex-token"${attrs} data-tooltip="${shortDef}" data-token="${token}">${content}</span>`;
      }
      return match;
    });
  }

  _normalizeToken(token) {
    // Normalizar tokens LaTeX comunes
    const normalized = token
      .replace(
        /^\\(?:operatorname|mathrm|mathit|mathbf|boldsymbol|mathcal|mathbb|mathfrak|mathscr)\{([^}]+)\}$/,
        '$1'
      )
      .replace(/^\\?([a-zA-Z]+)$/, '$1')
      .replace(/[{}]/g, '')
      .trim()
      .toLowerCase();

    // Mapeos comunes
    const mappings = {
      '+': 'addition',
      '-': 'subtraction',
      '−': 'subtraction',
      '×': 'multiplication',
      '÷': 'division',
      '=': 'equality',
      '>': 'greater-than',
      '<': 'less-than',
      '%': 'percentage',
      lim: 'limit',
      sum: 'summation',
      int: 'integral',
      partial: 'partial-derivative',
      infty: 'infinity',
      to: 'arrow',
      rightarrow: 'arrow',
      leftarrow: 'arrow',
      leftrightarrow: 'arrow',
      leq: 'less-equal',
      geq: 'greater-equal',
      neq: 'not-equal',
      approx: 'approximately',
      sim: 'similar',
      equiv: 'equivalent',
      propto: 'proportional',
      in: 'element-of',
      notin: 'not-element-of',
      subset: 'subset',
      supset: 'superset',
      cup: 'union',
      cap: 'intersection',
      setminus: 'set-difference',
      emptyset: 'empty-set',
      forall: 'for-all',
      exists: 'exists',
      nexists: 'not-exists',
      Rightarrow: 'implies',
      Leftarrow: 'implied-by',
      Leftrightarrow: 'iff',
      neg: 'not',
      land: 'and',
      lor: 'or',
      lnot: 'not',
      cdot: 'multiply',
      times: 'multiply',
      div: 'divide',
      frac: 'fraction',
      sqrt: 'root',
      '^': 'power',
      _: 'subscript',
      prime: 'derivative',
      dot: 'derivative',
      ddot: 'second-derivative',
      vec: 'vector',
      hat: 'unit-vector',
      bar: 'mean',
      tilde: 'approx',
      overline: 'conjugate',
      underline: 'underline',
      alpha: 'alpha',
      beta: 'beta',
      gamma: 'gamma',
      delta: 'delta',
      epsilon: 'epsilon',
      zeta: 'zeta',
      eta: 'eta',
      theta: 'theta',
      iota: 'iota',
      kappa: 'kappa',
      lambda: 'lambda',
      mu: 'mu',
      nu: 'nu',
      xi: 'xi',
      pi: 'pi',
      rho: 'rho',
      sigma: 'sigma',
      tau: 'tau',
      upsilon: 'upsilon',
      phi: 'phi',
      chi: 'chi',
      psi: 'psi',
      omega: 'omega',
    };

    return mappings[normalized] || normalized;
  }

  _escapeHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }

  _attachTokenListeners() {
    this.shadowRoot.querySelectorAll('.latex-token').forEach((token) => {
      token.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openFormulaExplorer(token.dataset.token);
      });
      token.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._openFormulaExplorer(token.dataset.token);
        }
      });
    });
  }

  _openFormulaExplorer(token) {
    const event = new CustomEvent('formula-explore', {
      bubbles: true,
      composed: true,
      detail: { token, latex: this._latex },
    });
    this.dispatchEvent(event);
  }
}

if (!customElements.get('latex-renderer')) {
  customElements.define('latex-renderer', LatexRenderer);
}

// Función helper para uso programático
export function renderLatex(latex, options = {}) {
  const { displayMode = false } = options;
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch (e) {
    return `<span class="katex-error">Error: ${e.message}</span>`;
  }
}

export function renderLatexToElement(element, latex, options = {}) {
  element.innerHTML = renderLatex(latex, options);
  if (options.interactive) {
    // Re-process for tooltips would need the component
  }
}

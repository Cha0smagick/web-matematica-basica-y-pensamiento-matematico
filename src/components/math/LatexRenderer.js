// LatexRenderer - Render KaTeX con hover explicativo por token
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { glossary } from '../../data/glossary.js';

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
    if (oldVal !== newVal) {
      this[`_${name.replace('-', '')}`] = name === 'display-mode' ? newVal !== null : newVal;
      this.render();
    }
  }

  get latex() { return this._latex; }
  set latex(val) { this._latex = val; this.setAttribute('latex', val); }

  get displayMode() { return this._displayMode; }
  set displayMode(val) { this._displayMode = val; this.setAttribute('display-mode', val); }

  get interactive() { return this._interactive; }
  set interactive(val) { this._interactive = val; this.setAttribute('interactive', val); }

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
        globalGroup: true
      });

      let processedHtml = html;
      
      if (this._interactive) {
        processedHtml = this._injectTooltips(html);
      }

      const sizeClass = `latex-${this._size}`;
      const displayClass = this._displayMode ? 'latex-display' : 'latex-inline';

      this.shadowRoot.innerHTML = `
        <style>
          :host { display: inline-block; }
          .latex-wrapper { position: relative; }
          .latex-display { display: block; text-align: center; margin: var(--spacing-md) 0; overflow-x: auto; }
          .latex-inline { display: inline; }
          .katex { font-size: var(--math-font-size, 1.1em) !important; }
          .latex-sm .katex { font-size: 0.9em !important; }
          .latex-lg .katex { font-size: 1.3em !important; }
          .latex-xl .katex { font-size: 1.5em !important; }
          .latex-token { cursor: help; position: relative; transition: background var(--transition-fast); border-radius: 2px; }
          .latex-token:hover { background: var(--primary-light); }
          [data-theme="dark"] .latex-token:hover { background: var(--primary-900); }
          .latex-token:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
          .latex-empty { color: var(--text-muted); font-style: italic; font-size: var(--font-size-sm); }
          .katex-error { color: var(--error); font-size: var(--font-size-sm); font-family: var(--font-mono); background: var(--error-light); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); }
        </style>
        <div class="latex-wrapper ${displayClass} ${sizeClass}" role="math" aria-label="Fórmula matemática">${processedHtml}</div>
      `;

      this._attachTokenListeners();
    } catch (e) {
      this.shadowRoot.innerHTML = `<div class="katex-error">Error LaTeX: ${e.message}</div>`;
    }
  }

  _injectTooltips(html) {
    // KaTeX genera spans con clases como .mord, .mop, .mbin, .mrel, .mpunct, .minner, .mopen, .mclose
    // Inyectamos data-tooltip en tokens matemáticos significativos
    const tokenRegex = /<span class="([^"]*(?:mord|mop|mbin|mrel|mpunct|minner|mopen|mclose)[^"]*)"([^>]*)>([^<]+)<\/span>/g;
    
    return html.replace(tokenRegex, (match, className, attrs, content) => {
      const token = this._normalizeToken(content);
      const glossaryEntry = glossary[token];
      
      if (glossaryEntry) {
        const shortDef = glossaryEntry.short || glossaryEntry.definition;
        return `<span class="latex-token" data-tooltip="${this._escapeHtml(shortDef)}" data-token="${token}" tabindex="0"${attrs}>${content}</span>`;
      }
      return match;
    });
  }

  _normalizeToken(token) {
    // Normalizar tokens LaTeX comunes
    const normalized = token
      .replace(/^\\(?:operatorname|mathrm|mathit|mathbf|boldsymbol|mathcal|mathbb|mathfrak|mathscr)\{([^}]+)\}$/, '$1')
      .replace(/^\\?([a-zA-Z]+)$/, '$1')
      .replace(/[{}]/g, '')
      .trim()
      .toLowerCase();
    
    // Mapeos comunes
    const mappings = {
      'lim': 'limit',
      'sum': 'summation',
      'int': 'integral',
      'partial': 'partial-derivative',
      'infty': 'infinity',
      'to': 'arrow',
      'rightarrow': 'arrow',
      'leftarrow': 'arrow',
      'leftrightarrow': 'arrow',
      'leq': 'less-equal',
      'geq': 'greater-equal',
      'neq': 'not-equal',
      'approx': 'approximately',
      'sim': 'similar',
      'equiv': 'equivalent',
      'propto': 'proportional',
      'in': 'element-of',
      'notin': 'not-element-of',
      'subset': 'subset',
      'supset': 'superset',
      'cup': 'union',
      'cap': 'intersection',
      'setminus': 'set-difference',
      'emptyset': 'empty-set',
      'forall': 'for-all',
      'exists': 'exists',
      'nexists': 'not-exists',
      'Rightarrow': 'implies',
      'Leftarrow': 'implied-by',
      'Leftrightarrow': 'iff',
      'neg': 'not',
      'land': 'and',
      'lor': 'or',
      'lnot': 'not',
      'Rightarrow': 'implies',
      'cdot': 'multiply',
      'times': 'multiply',
      'div': 'divide',
      'frac': 'fraction',
      'sqrt': 'square-root',
      'sqrt': 'root',
      '^': 'power',
      '_': 'subscript',
      'prime': 'derivative',
      'dot': 'derivative',
      'ddot': 'second-derivative',
      'vec': 'vector',
      'hat': 'unit-vector',
      'bar': 'mean',
      'tilde': 'approx',
      'overline': 'conjugate',
      'underline': 'underline',
      'alpha': 'alpha',
      'beta': 'beta',
      'gamma': 'gamma',
      'delta': 'delta',
      'epsilon': 'epsilon',
      'zeta': 'zeta',
      'eta': 'eta',
      'theta': 'theta',
      'iota': 'iota',
      'kappa': 'kappa',
      'lambda': 'lambda',
      'mu': 'mu',
      'nu': 'nu',
      'xi': 'xi',
      'pi': 'pi',
      'rho': 'rho',
      'sigma': 'sigma',
      'tau': 'tau',
      'upsilon': 'upsilon',
      'phi': 'phi',
      'chi': 'chi',
      'psi': 'psi',
      'omega': 'omega'
    };
    
    return mappings[normalized] || normalized;
  }

  _escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' }[c]));
  }

  _attachTokenListeners() {
    this.shadowRoot.querySelectorAll('.latex-token').forEach(token => {
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
      detail: { token, latex: this._latex }
    });
    this.dispatchEvent(event);
  }
}

if (!customElements.get('latex-renderer')) {
  customElements.define('latex-renderer', LatexRenderer);
}

// Función helper para uso programático
export function renderLatex(latex, options = {}) {
  const { displayMode = false, interactive = true, size = 'normal' } = options;
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true
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
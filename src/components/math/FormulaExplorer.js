// FormulaExplorer - Modal detallado para explorar fórmulas
import { glossary } from '../../data/glossary.js';
import { formulas } from '../../data/formulas.js';

export class FormulaExplorer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentFormula = null;
    this._currentToken = null;
  }

  connectedCallback() {
    this.render();
  }

  static open(formulaId, token = null) {
    let explorer = document.querySelector('formula-explorer');
    if (!explorer) {
      explorer = document.createElement('formula-explorer');
      document.body.appendChild(explorer);
    }
    explorer.show(formulaId, token);
    return explorer;
  }

  show(formulaId, token = null) {
    this._currentFormula = formulas[formulaId] || null;
    this._currentToken = token;
    this.render();
    this.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.shadowRoot.querySelector('.modal-overlay').focus();
  }

  hide() {
    this.style.display = 'none';
    document.body.style.overflow = '';
  }

  render() {
    if (!this._currentFormula) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const formula = this._currentFormula;
    const tokens = this._extractTokens(formula.latex);
    
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: fixed; inset: 0; z-index: var(--z-modal); }
        .modal-overlay { position: absolute; inset: 0; background: var(--bg-overlay); animation: fadeIn var(--transition-fast); }
        .modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-secondary); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); max-width: 900px; width: 90vw; max-height: 90vh; display: flex; flex-direction: column; animation: slideUp var(--transition-normal); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-lg); border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .modal-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); }
        .modal-close { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); color: var(--text-muted); transition: all var(--transition-fast); }
        .modal-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .modal-body { padding: var(--spacing-lg); overflow: auto; flex: 1; display: grid; grid-template-columns: 1fr 350px; gap: var(--spacing-lg); }
        @media (max-width: 1024px) { .modal-body { grid-template-columns: 1fr; } }
        .formula-main { display: flex; flex-direction: column; gap: var(--spacing-lg); }
        .formula-display { background: var(--bg-tertiary); border-radius: var(--radius-lg); padding: var(--spacing-xl); text-align: center; overflow-x: auto; }
        .formula-meta { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); }
        .meta-tag { padding: var(--spacing-xs) var(--spacing-sm); background: var(--bg-quaternary); border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
        .formula-sidebar { display: flex; flex-direction: column; gap: var(--spacing-lg); }
        .sidebar-section { background: var(--bg-tertiary); border-radius: var(--radius-lg); padding: var(--spacing-md); }
        .sidebar-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); padding-bottom: var(--spacing-sm); border-bottom: 1px solid var(--border-color); }
        .token-list { display: flex; flex-direction: column; gap: var(--spacing-xs); max-height: 300px; overflow-y: auto; }
        .token-item { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-xs) var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-md); cursor: pointer; transition: background var(--transition-fast); }
        .token-item:hover { background: var(--bg-quaternary); }
        .token-item.active { background: var(--primary-light); border: 1px solid var(--primary); }
        .token-symbol { font-family: var(--font-math); font-size: var(--font-size-lg); font-weight: bold; color: var(--primary); min-width: 2em; text-align: center; }
        .token-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); flex: 1; }
        .token-def { font-size: var(--font-size-xs); color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .detail-panel { display: none; }
        .detail-panel.active { display: block; animation: fadeIn var(--transition-fast); }
        .detail-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); }
        .detail-text { font-size: var(--font-size-sm); line-height: var(--line-height-relaxed); color: var(--text-secondary); }
        .detail-analogy { background: var(--bg-quaternary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-md); font-style: italic; }
        .detail-related { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin-top: var(--spacing-md); }
        .related-tag { font-size: var(--font-size-xs); padding: 2px 8px; background: var(--primary-light); color: var(--primary-dark); border-radius: var(--radius-full); }
        .action-buttons { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid var(--border-color); }
        .btn-action { flex: 1; padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); }
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: var(--spacing-md); }
        .tab { padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--text-muted); border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; }
        .tab:hover { color: var(--text-secondary); }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }
        .history-timeline { display: flex; flex-direction: column; gap: var(--spacing-md); }
        .history-item { padding-left: var(--spacing-lg); border-left: 2px solid var(--primary-light); position: relative; }
        .history-item::before { content: ''; position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--primary); border: 2px solid var(--bg-secondary); }
        .history-year { font-weight: bold; color: var(--primary); font-size: var(--font-size-sm); }
        .history-text { font-size: var(--font-size-sm); color: var(--text-secondary); }
        .variation-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: var(--spacing-xs); }
        .variation-latex { font-family: var(--font-mono); font-size: var(--font-size-sm); flex: 1; }
        .application-card { padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); border-left: 3px solid var(--primary); }
        .application-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); }
        .application-desc { font-size: var(--font-size-sm); color: var(--text-secondary); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      </style>
      
      <div class="modal-overlay" tabindex="-1" aria-hidden="true"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="formula-title">
        <header class="modal-header">
          <h2 class="modal-title" id="formula-title">${formula.name}</h2>
          <button class="modal-close" aria-label="Cerrar explorador">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div class="modal-body">
          <main class="formula-main">
            <div class="formula-display">
              <latex-renderer latex="${this._escapeHtml(formula.latex)}" display-mode interactive size="lg"></latex-renderer>
            </div>
            <div class="formula-meta">
              <span class="meta-tag">${formula.category}</span>
              <span class="meta-tag">Fase ${formula.phase}</span>
              <span class="meta-tag">Módulo ${formula.module}</span>
              ${formula.tags.map(t => `<span class="meta-tag">${t}</span>`).join('')}
            </div>
            
            <div class="tabs" role="tablist">
              <button class="tab active" role="tab" aria-selected="true" data-tab="definition">Definición</button>
              <button class="tab" role="tab" aria-selected="false" data-tab="history">Historia</button>
              <button class="tab" role="tab" aria-selected="false" data-tab="variations">Variaciones</button>
              <button class="tab" role="tab" aria-selected="false" data-tab="applications">Aplicaciones</button>
            </div>
            
            <div class="tab-panel active" role="tabpanel" id="panel-definition">
              <div class="detail-panel active" id="detail-overview">
                <h3 class="detail-title">${formula.name}</h3>
                <div class="detail-text">${formula.description}</div>
                ${formula.analogy ? `<div class="detail-analogy">"${formula.analogy}"</div>` : ''}
                ${formula.derivation ? `
                  <details style="margin-top: var(--spacing-md);">
                    <summary style="cursor: pointer; font-weight: var(--font-weight-medium);">Ver derivación paso a paso</summary>
                    <div style="margin-top: var(--spacing-md); font-family: var(--font-mono); font-size: var(--font-size-sm); white-space: pre-wrap;">${formula.derivation}</div>
                  </details>
                ` : ''}
              </div>
              <div class="detail-panel" id="detail-token"></div>
            </div>
            
            <div class="tab-panel" role="tabpanel" id="panel-history">
              <div class="history-timeline">
                ${formula.history.map(h => `
                  <div class="history-item">
                    <div class="history-year">${h.year}</div>
                    <div class="history-text">${h.event}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="tab-panel" role="tabpanel" id="panel-variations">
              ${formula.variations.map(v => `
                <div class="variation-item">
                  <latex-renderer latex="${this._escapeHtml(v.latex)}" size="sm"></latex-renderer>
                  <span class="variation-desc">${v.description}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="tab-panel" role="tabpanel" id="panel-applications">
              ${formula.applications.map(a => `
                <div class="application-card">
                  <div class="application-title">${a.context}</div>
                  <div class="application-desc">${a.description}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="action-buttons">
              <button class="btn btn-primary btn-action" id="btn-try">Probar con números</button>
              <button class="btn btn-outline btn-action" id="btn-copy">Copiar LaTeX</button>
              <button class="btn btn-outline btn-action" id="btn-download">Descargar imagen</button>
            </div>
          </main>
          
          <aside class="formula-sidebar">
            <section class="sidebar-section">
              <h3 class="sidebar-title">Símbolos en la fórmula</h3>
              <div class="token-list" role="listbox" aria-label="Símbolos">
                ${tokens.map((t, i) => `
                  <div class="token-item ${i === 0 ? 'active' : ''}" role="option" data-token="${t.token}" tabindex="0">
                    <span class="token-symbol">${t.symbol}</span>
                    <span class="token-name">${glossary[t.token]?.term || t.token}</span>
                    <span class="token-def">${glossary[t.token]?.short || ''}</span>
                  </div>
                `).join('')}
              </div>
            </section>
            
            <section class="sidebar-section">
              <h3 class="sidebar-title">Acciones rápidas</h3>
              <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                <button class="btn btn-outline btn-sm" id="quick-derive">Ver derivación</button>
                <button class="btn btn-outline btn-sm" id="quick-examples">Ejemplos numéricos</button>
                <button class="btn btn-outline btn-sm" id="quick-related">Fórmulas relacionadas</button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    `;

    this._attachEvents();
    this._showTokenDetail(this._currentToken || tokens[0]?.token);
  }

  _extractTokens(latex) {
    // Extraer tokens únicos de la fórmula LaTeX
    const tokens = [];
    const seen = new Set();
    
    // Patrones comunes
    const patterns = [
      /\\([a-zA-Z]+)/g,  // \comando
      /([\+\-\=\<\>\≤\≥\≠\≈\∑\∫\∂\∞\∈\∉\⊂\⊃\∪\∩\∀\∃\¬\∧\∨\→\←\↔\⇒\⇐\⇔\·\×\÷\±\∓\√\∛\∜\∝\≡\≢\≮\≯\∥\∦\∴\∵\∶\∷\∸\∹\∺\∻\∼\∽\≂\≃\≄\≅\≆\≇\≈\≉\≊\≋\≌\≍\≎\≏\≐\≑\≒\≓\≔\≕\≖\≗\≘\≙\≚\≛\≜\≝\≞\≟\≠\≡\≢\≣\≤\≥\≦\≧\≨\≩\≪\≫\≬\≭\≮\≯\≰\≱\≲\≳\≴\≵\≶\≷\≸\≹\≺\≻\≼\≽\≾\≿\⊀\⊁\⊂\⊃\⊄\⊅\⊆\⊇\⊈\⊉\⊊\⊋\⊌\⊍\⊎\⊏\⊐\⊑\⊒\⊓\⊔\⊕\⊖\⊗\⊘\⊙\⊚\⊛\⊜\⊝\⊞\⊟\⊠\⊡\⊢\⊣\⊤\⊥\⊦\⊧\⊨\⊩\⊪\⊫\⊬\⊭\⊮\⊯\⊰\⊱\⊲\⊳\⊴\⊵\⊶\⊷\⊸\⊹\⊺\⊻\⊼\⊽\⊾\⊿\⋀\⋁\⋂\⋃\⋄\⋆\⋇\⋈\⋉\⋊\⋋\⋌\⋍\⋎\⋏\⋐\⋑\⋒\⋓\⋔\⋕\⋖\⋗\⋘\⋙\⋚\⋛\⋜\⋝\⋞\⋟\⋠\⋡\⋢\⋣\⋤\⋥\⋦\⋧\⋨\⋩\⋪\⋫\⋬\⋭\⋮\⋯\⋰\⋱\⋲\⋳\⋴\⋵\⋶\⋷\⋸\⋹\⋺\⋻\⋼\⋽\⋾\⋿)/g,  // Símbolos
      /([a-zA-Z])/g  // Variables simples
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(latex)) !== null) {
        const token = match[1].toLowerCase();
        if (!seen.has(token) && glossary[token]) {
          seen.add(token);
          tokens.push({ token, symbol: match[0] });
        }
      }
    }
    
    return tokens.slice(0, 20); // Limitar
  }

  _showTokenDetail(token) {
    if (!token || !glossary[token]) return;
    
    const entry = glossary[token];
    const panel = this.shadowRoot.getElementById('detail-token');
    const overview = this.shadowRoot.getElementById('detail-overview');
    
    overview.style.display = 'none';
    panel.style.display = 'block';
    panel.classList.add('active');
    
    panel.innerHTML = `
      <h3 class="detail-title">${entry.term} (${entry.symbol || token})</h3>
      <div class="detail-text">${entry.long || entry.definition}</div>
      ${entry.analogy ? `<div class="detail-analogy">"${entry.analogy}"</div>` : ''}
      ${entry.visual ? `<div style="margin-top: var(--spacing-md);"><img src="${entry.visual}" alt="${entry.term}" style="max-width: 100%; border-radius: var(--radius-md);"></div>` : ''}
      ${entry.related && entry.related.length ? `
        <div class="detail-related">
          ${entry.related.map(r => glossary[r] ? `<span class="related-tag">${glossary[r].term}</span>` : '').join('')}
        </div>
      ` : ''}
    `;
    
    // Actualizar token activo en lista
    this.shadowRoot.querySelectorAll('.token-item').forEach(item => {
      item.classList.toggle('active', item.dataset.token === token);
    });
  }

  _attachEvents() {
    // Close
    this.shadowRoot.querySelector('.modal-close').addEventListener('click', () => this.hide());
    this.shadowRoot.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hide();
    });
    
    // Tabs
    this.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.shadowRoot.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.shadowRoot.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.shadowRoot.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
      });
    });
    
    // Token items
    this.shadowRoot.querySelectorAll('.token-item').forEach(item => {
      item.addEventListener('click', () => this._showTokenDetail(item.dataset.token));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._showTokenDetail(item.dataset.token);
        }
      });
    });
    
    // Action buttons
    this.shadowRoot.getElementById('btn-copy').addEventListener('click', () => this._copyLatex());
    this.shadowRoot.getElementById('btn-download').addEventListener('click', () => this._downloadImage());
    this.shadowRoot.getElementById('btn-try').addEventListener('click', () => this._openCalculator());
    
    // Quick actions
    this.shadowRoot.getElementById('quick-derive').addEventListener('click', () => this._showDerivation());
    this.shadowRoot.getElementById('quick-examples').addEventListener('click', () => this._showExamples());
    this.shadowRoot.getElementById('quick-related').addEventListener('click', () => this._showRelated());
    
    // ESC key
    this._escHandler = (e) => { if (e.key === 'Escape') this.hide(); };
    document.addEventListener('keydown', this._escHandler);
  }

  _escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' }[c]));
  }

  _copyLatex() {
    navigator.clipboard.writeText(this._currentFormula.latex).then(() => {
      this._showToast('LaTeX copiado al portapapeles');
    });
  }

  _downloadImage() {
    // Render to canvas and download
    const renderer = this.shadowRoot.querySelector('latex-renderer');
    if (renderer && renderer.shadowRoot) {
      const katexEl = renderer.shadowRoot.querySelector('.katex');
      if (katexEl) {
        // Would need html2canvas or similar
        this._showToast('Función de descarga próximamente');
      }
    }
  }

  _openCalculator() {
    this.hide();
    // Dispatch event to open calculator with this formula
    window.dispatchEvent(new CustomEvent('open-calculator', { 
      detail: { formula: this._currentFormula } 
    }));
  }

  _showDerivation() {
    this.shadowRoot.querySelector('[data-tab="definition"]').click();
  }

  _showExamples() {
    // Show numerical examples
    this._showToast('Ejemplos numéricos próximamente');
  }

  _showRelated() {
    this._showToast('Fórmulas relacionadas próximamente');
  }

  _showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: var(--spacing-xl); left: 50%; transform: translateX(-50%);
      background: var(--neutral-900); color: white; padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md); z-index: var(--z-toast); animation: fadeIn var(--transition-fast);
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut var(--transition-fast)'; setTimeout(() => toast.remove(), 200); }, 3000);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._escHandler);
  }
}

if (!customElements.get('formula-explorer')) {
  customElements.define('formula-explorer', FormulaExplorer);
}
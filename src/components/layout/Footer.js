// Footer - Pie de página
export class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const year = new Date().getFullYear();
    
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .footer {
          padding: var(--spacing-xl) var(--spacing-lg);
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-md); }
        .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--spacing-md); font-size: var(--font-size-sm); }
        .footer-link { color: var(--text-muted); text-decoration: none; transition: color var(--transition-fast); }
        .footer-link:hover { color: var(--primary); }
        .footer-copyright { font-size: var(--font-size-xs); color: var(--text-muted); }
        .footer-badges { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; justify-content: center; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-tertiary); border-radius: 999px; font-size: var(--font-size-xs); color: var(--text-secondary); }
      </style>
      
      <footer class="footer" role="contentinfo">
        <div class="footer-content">
          <div class="footer-links">
            <a href="#/" class="footer-link">Inicio</a>
            <a href="#/dashboard" class="footer-link">Dashboard</a>
            <a href="#/settings" class="footer-link">Configuración</a>
            <a href="https://github.com" target="_blank" rel="noopener" class="footer-link">GitHub</a>
            <a href="#/privacy" class="footer-link">Privacidad</a>
            <a href="#/terms" class="footer-link">Términos</a>
          </div>
          <div class="footer-badges">
            <span class="badge">🧮 Vanilla JS</span>
            <span class="badge">📐 KaTeX</span>
            <span class="badge">📊 D3/Function-plot</span>
            <span class="badge">💾 IndexedDB</span>
            <span class="badge">♿ WCAG 2.1 AA</span>
            <span class="badge">📱 PWA</span>
          </div>
          <p class="footer-copyright">
            © ${year} Matemática Básica y Pensamiento Matemático.
            Curso libre y gratuito para aprender matemáticas sin ansiedad.
            Hecho con ❤️ para ti.
          </p>
        </div>
      </footer>
    `;
  }
}

if (!customElements.get('app-footer')) {
  customElements.define('app-footer', Footer);
}
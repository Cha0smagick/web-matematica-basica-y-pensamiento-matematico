// NotFoundPage - Ruta inexistente
export class NotFoundPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const path = window.location.hash.slice(1);
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .nf { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-md); padding: var(--spacing-xl); text-align: center; }
        .nf-code { font-size: var(--font-size-5xl); font-weight: var(--font-weight-bold); color: var(--primary); }
        .nf-path { font-family: var(--font-mono); font-size: var(--font-size-sm); color: var(--text-muted); word-break: break-all; }
      </style>
      <div class="nf">
        <div class="nf-code">404</div>
        <h1>No encontramos esta página</h1>
        <p class="nf-path">${path}</p>
        <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/')">Volver al inicio</button>
      </div>
    `;
  }
}

if (!customElements.get('page-not-found')) {
  customElements.define('page-not-found', NotFoundPage);
}

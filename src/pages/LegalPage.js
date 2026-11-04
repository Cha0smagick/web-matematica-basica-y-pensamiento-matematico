// LegalPage - Privacidad, términos y licencia
import baseStyles from '../styles/shadow-base.css?inline';

export class LegalPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .legal { padding: var(--spacing-lg); max-width: 760px; margin: 0 auto; line-height: var(--line-height-relaxed); }
        .legal h2 { font-size: var(--font-size-xl); margin: var(--spacing-xl) 0 var(--spacing-sm) 0; }
        .legal p, .legal li { color: var(--text-secondary); font-size: var(--font-size-sm); }
        .legal ul { padding-left: var(--spacing-lg); }
        .legal strong { color: var(--text-primary); }
      </style>
      <div class="legal">
        <h1>Privacidad y Términos</h1>

        <h2>🔐 Privacidad</h2>
        <p>Este sitio funciona <strong>100% en tu navegador</strong> y no tiene servidor propio:</p>
        <ul>
          <li>Tu progreso, logros y configuración se guardan <strong>localmente</strong> (localStorage e IndexedDB) en tu dispositivo.</li>
          <li><strong>No recopilamos, transmitimos ni vendemos datos personales.</strong></li>
          <li>Puedes borrar todo tu progreso desde <a href="#/settings">Configuración</a> en cualquier momento.</li>
          <li>Las fuentes tipográficas se cargan desde Google Fonts, que puede registrar la solicitud (consulta su política de privacidad).</li>
        </ul>

        <h2>📜 Términos de uso</h2>
        <ul>
          <li>El curso es <strong>gratuito</strong> y se ofrece tal cual, sin garantías.</li>
          <li>Las <strong>constancias de finalización son documentos de motivación generados localmente</strong>: no son certificados oficiales ni acreditan estudios formales.</li>
          <li>El contenido se publica por fases; las fases marcadas "en desarrollo" aún no están disponibles.</li>
        </ul>

        <h2>⚖️ Licencia</h2>
        <p>Código bajo licencia <strong>MIT</strong>. Contenido educativo (textos, lecciones y ejercicios) bajo <strong>CC BY-SA 4.0</strong>: puedes compartirlo y adaptarlo citando la fuente y manteniendo la misma licencia.</p>

        <div style="margin-top: var(--spacing-xl);">
          <button class="btn btn-outline" onclick="window.__APP_ROUTER__.navigate('/')">← Volver al inicio</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-legal')) {
  customElements.define('page-legal', LegalPage);
}

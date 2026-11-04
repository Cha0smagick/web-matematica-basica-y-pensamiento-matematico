// DiplomaPage - Generador y visor de constancias de finalización
// Nota: es una constancia local con código de referencia; NO es un certificado oficial.
import { store } from '../store/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class DiplomaPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this._loadDiploma();
  }

  async _loadDiploma() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/diploma\/(.+)\/(.+)$/);
    const type = match ? match[1] : 'lesson';
    const id = match ? match[2] : 'l0-1-1';

    this._diplomaData = await store.achievements.generateDiplomaData(type, id);
    this.render();
  }

  render() {
    const d = this._diplomaData || { title: 'Constancia', recipient: 'Estudiante', date: '', verificationHash: '', stats: {} };

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .diploma-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .diploma-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .diploma-info h1 { margin: 0; font-size: var(--font-size-2xl); }

        .diploma-container { display: flex; justify-content: center; margin-bottom: var(--spacing-xl); }
        .diploma { width: 100%; max-width: 700px; background: #f9f5eb; border: 2px solid #8b4513; border-radius: var(--radius-xl); padding: var(--spacing-2xl); box-shadow: var(--shadow-xl); position: relative; overflow: hidden; font-family: 'Georgia', serif; }
        [data-theme="dark"] .diploma { background: #2d1b10; color: #f3e5ab; border-color: #d4a017; }
        .diploma-seal { position: absolute; top: 30px; right: 30px; width: 60px; height: 60px; border: 3px solid #d4a017; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .diploma-title { text-align: center; font-size: 26px; font-weight: bold; color: #8b4513; margin-bottom: var(--spacing-md); text-transform: uppercase; letter-spacing: 2px; }
        [data-theme="dark"] .diploma-title { color: #d4a017; }
        .diploma-subtitle { text-align: center; font-size: 15px; color: #666; margin-bottom: var(--spacing-xl); }
        [data-theme="dark"] .diploma-subtitle { color: #aaa; }
        .diploma-recipient { text-align: center; font-size: 22px; font-weight: bold; margin: var(--spacing-xl) 0; color: #2d1b10; }
        [data-theme="dark"] .diploma-recipient { color: #f3e5ab; }
        .diploma-body { text-align: center; font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: var(--spacing-xl); }
        [data-theme="dark"] .diploma-body { color: #ccc; }
        .diploma-achievement { display: inline-block; background: #d4a017; color: #2d1b10; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); font-weight: bold; margin-bottom: var(--spacing-lg); }
        .diploma-date { text-align: right; font-size: 14px; color: #666; margin-bottom: var(--spacing-lg); }
        .diploma-hash { font-family: monospace; font-size: 10px; color: #888; text-align: center; margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px solid #ccc; }

        .verify-info { margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--bg-tertiary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
        .verify-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); }
        .verify-hash { font-family: monospace; background: var(--bg-primary); padding: var(--spacing-sm); border-radius: var(--radius-md); display: inline-block; margin-bottom: var(--spacing-sm); }
        .verify-note { font-size: var(--font-size-xs); color: var(--text-muted); margin: var(--spacing-sm) 0 0 0; }
      </style>

      <div class="diploma-page">
        <div class="diploma-header">
          <a href="#/dashboard" class="back-btn">← Volver al Dashboard</a>
          <div class="diploma-info">
            <h1>${d.title}</h1>
            <p>${d.subtitle || 'Constancia de finalización'}</p>
          </div>
        </div>

        <div class="diploma-container">
          <div class="diploma" id="diploma-canvas">
            <div class="diploma-seal">🏅</div>
            <div class="diploma-title">${d.title}</div>
            <div class="diploma-subtitle">Constancia de finalización — ${d.subtitle || 'Matemática Básica'}</div>
            <div class="diploma-recipient">Se hace constar que<br>${d.recipient}</div>
            <div class="diploma-body">ha completado satisfactoriamente<br><span class="diploma-achievement">${d.achievement?.title || d.title}</span><br>${d.achievement?.description || ''}</div>
            <div class="diploma-date">Fecha: ${d.date}</div>
            <div class="diploma-hash">Código de referencia: ${d.verificationHash}</div>
          </div>
        </div>

        <div class="diploma-actions" style="display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" data-pdf>📄 Descargar PDF</button>
          <button class="btn btn-outline" data-share>🔗 Compartir</button>
        </div>

        <div class="verify-info">
          <div class="verify-title">ℹ️ Sobre este documento</div>
          <div class="verify-hash">${d.verificationHash}</div>
          <p class="verify-note">
            Este es un documento generado localmente con fines de motivación y registro personal.
            <strong>No es un certificado oficial ni acredita estudios formales.</strong>
            El código de referencia se calcula a partir de tu identificación de usuario y el logro obtenido.
          </p>
        </div>
      </div>
    `;

    this._attachDiplomaListeners();
  }

  _attachDiplomaListeners() {
    const root = this.shadowRoot;

    root.querySelector('[data-pdf]')?.addEventListener('click', async () => {
      const d = this._diplomaData;
      try {
        // Import diferido: jspdf solo se descarga si el usuario pide el PDF
        const mod = await import('jspdf');
        const jsPDF = mod.default || mod.jsPDF;
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(d.title, 105, 60, { align: 'center' });
        doc.setFontSize(13);
        doc.setFont('helvetica', 'normal');
        doc.text(d.subtitle || 'Constancia de finalización', 105, 80, { align: 'center' });
        doc.setFontSize(18);
        doc.text(d.recipient, 105, 120, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Fecha: ${d.date}`, 105, 150, { align: 'center' });
        doc.text(`Código de referencia: ${d.verificationHash}`, 105, 170, { align: 'center' });
        doc.save(`constancia-${d.type}-${d.id}.pdf`);
      } catch (e) {
        console.error('No se pudo generar el PDF:', e);
        alert('No se pudo generar el PDF. Inténtalo de nuevo.');
      }
    });

    root.querySelector('[data-share]')?.addEventListener('click', () => {
      const d = this._diplomaData;
      if (navigator.share) {
        navigator.share({
          title: d.title,
          text: `¡Completé: ${d.title}!`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('¡Enlace copiado al portapapeles!');
        });
      }
    });
  }
}

if (!customElements.get('page-diploma')) {
  customElements.define('page-diploma', DiplomaPage);
}

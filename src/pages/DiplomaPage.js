// DiplomaPage - Generador y visor de diplomas
import { store } from '../store/index.js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

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
    
    this._diplomaData = store.achievements.generateDiplomaData(type, id);
    this.render();
  }

  render() {
    const d = this._diplomaData || { title: 'Diploma', recipient: 'Estudiante', date: '', verificationHash: '', stats: {} };
    
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .diploma-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .diploma-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .diploma-info h1 { margin: 0; font-size: var(--font-size-3xl); }
        .diploma-info p { margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); }
        
        .diploma-container { display: flex; justify-content: center; margin-bottom: var(--spacing-xl); }
        .diploma { width: 100%; max-width: 700px; background: #f9f5eb; border: 2px solid #8b4513; border-radius: var(--radius-xl); padding: var(--spacing-2xl); box-shadow: var(--shadow-xl); position: relative; overflow: hidden; font-family: 'Georgia', serif; }
        [data-theme="dark"] .diploma { background: #2d1b10; color: #f3e5ab; border-color: #d4a017; }
        .diploma::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 10px; background: repeating-linear-gradient(45deg, #8b4513, #8b4513 10px, transparent 10px, transparent 20px); }
        .diploma-seal { position: absolute; top: 30px; right: 30px; width: 60px; height: 60px; border: 3px solid #d4a017; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .diploma-title { text-align: center; font-size: 28px; font-weight: bold; color: #8b4513; margin-bottom: var(--spacing-md); text-transform: uppercase; letter-spacing: 2px; }
        [data-theme="dark"] .diploma-title { color: #d4a017; }
        .diploma-subtitle { text-align: center; font-size: 16px; color: #666; margin-bottom: var(--spacing-xl); }
        [data-theme="dark"] .diploma-subtitle { color: #aaa; }
        .diploma-recipient { text-align: center; font-size: 22px; font-weight: bold; margin: var(--spacing-xl) 0; color: #2d1b10; }
        [data-theme="dark"] .diploma-recipient { color: #f3e5ab; }
        .diploma-body { text-align: center; font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: var(--spacing-xl); }
        [data-theme="dark"] .diploma-body { color: #ccc; }
        .diploma-achievement { display: inline-block; background: #d4a017; color: #2d1b10; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); font-weight: bold; margin-bottom: var(--spacing-lg); }
        [data-theme="dark"] .diploma-achievement { background: #f3e5ab; color: #2d1b10; }
        .diploma-date { text-align: right; font-size: 14px; color: #666; margin-bottom: var(--spacing-lg); }
        [data-theme="dark"] .diploma-date { color: #aaa; }
        .diploma-hash { font-family: monospace; font-size: 10px; color: #888; text-align: center; margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px solid #ccc; }
        [data-theme="dark"] .diploma-hash { color: #666; border-top-color: #555; }
        
        .diploma-actions { display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap; }
        .btn-diploma { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
        .btn-diploma.primary { background: var(--primary); color: white; border: none; }
        .btn-diploma.primary:hover { background: var(--primary-dark); }
        .btn-diploma.outline { border: 2px solid var(--border-color); color: var(--text-secondary); background: transparent; }
        .btn-diploma.outline:hover { border-color: var(--primary); color: var(--primary); }
        
        .verify-info { margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--bg-tertiary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
        .verify-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); }
        .verify-hash { font-family: monospace; background: var(--bg-primary); padding: var(--spacing-sm); border-radius: var(--radius-md); display: inline-block; margin-bottom: var(--spacing-sm); }
        .verify-url { font-size: var(--font-size-xs); color: var(--text-muted); word-break: break-all; }
      </style>
      
      <div class="diploma-page">
        <div class="diploma-header">
          <a href="#/dashboard" class="back-btn">← Volver al Dashboard</a>
          <div class="diploma-info">
            <h1>${d.title}</h1>
            <p>${d.subtitle || 'Certificado de Logro'}</p>
          </div>
        </div>
        
        <div class="diploma-container">
          <div class="diploma" id="diploma-canvas">
            <div class="diploma-seal">🏅</div>
            <div class="diploma-title">${d.title}</div>
            <div class="diploma-subtitle">Certificado Oficial de Logro Académico</div>
            <div class="diploma-recipient">Se certifica que<br>${d.recipient}</div>
            <div class="diploma-body">ha completado satisfactoriamente<br><span class="diploma-achievement">${d.achievement?.title || d.title}</span><br>${d.achievement?.description || ''}</div>
            <div class="diploma-date">Fecha: ${d.date}</div>
            <div class="diploma-hash">Código de verificación: ${d.verificationHash}</div>
          </div>
        </div>
        
        <div class="diploma-actions">
          <button class="btn btn-diploma primary" onclick="window.__APP_DIPLOMA__.downloadPDF()">📄 Descargar PDF</button>
          <button class="btn btn-diploma outline" onclick="window.__APP_DIPLOMA__.share()">🔗 Compartir</button>
          <button class="btn btn-diploma outline" onclick="window.__APP_DIPLOMA__.verify()">🔍 Verificar Autenticidad</button>
        </div>
        
        <div class="verify-info">
          <div class="verify-title">🔐 Información de Verificación</div>
          <div class="verify-hash">${d.verificationHash}</div>
          <div class="verify-url">https://tudominio.github.io/repo/verify/${d.verificationHash}</div>
          <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--spacing-sm);">Cualquier persona puede verificar la autenticidad de este diploma usando el código de verificación.</p>
        </div>
      </div>
    `;
    
    this._attachDiplomaListeners();
  }

  _attachDiplomaListeners() {
    window.__APP_DIPLOMA__ = window.__APP_DIPLOMA__ || {};
    
    window.__APP_DIPLOMA__.downloadPDF = () => {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        alert('PDF library cargándose... inténtalo de nuevo');
        return;
      }
      
      const diplomaEl = this.shadowRoot.getElementById('diploma-canvas');
      const d = this._diplomaData;
      
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(d.title, 105, 60, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(d.subtitle || 'Certificado de Logro', 105, 80, { align: 'center' });
      doc.setFontSize(18);
      doc.text(d.recipient, 105, 120, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Fecha: ${d.date}`, 105, 150, { align: 'center' });
      doc.text(`Código: ${d.verificationHash}`, 105, 170, { align: 'center' });
      
      doc.save(`diploma-${d.type}-${d.id}.pdf`);
    };
    
    window.__APP_DIPLOMA__.share = () => {
      const d = this._diplomaData;
      if (navigator.share) {
        navigator.share({
          title: d.title,
          text: `¡Obtuve el diploma: ${d.title}!`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('¡Enlace copiado al portapapeles!');
        });
      }
    };
    
    window.__APP_DIPLOMA__.verify = () => {
      const d = this._diplomaData;
      alert(`Verificando diploma: ${d.verificationHash}\nEn producción, esto consultaría un servidor de verificación.`);
    };
  }
}

if (!customElements.get('page-diploma')) {
  customElements.define('page-diploma', DiplomaPage);
}
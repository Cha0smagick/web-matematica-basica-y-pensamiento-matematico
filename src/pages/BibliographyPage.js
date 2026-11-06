// BibliographyPage - Sección de bibliografía con enlaces a libros en PDF
import bibliography from '../data/bibliography.json';
import baseStyles from '../styles/shadow-base.css?inline';

export class BibliographyPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  _renderBook(book) {
    const linkIcon = book.type === 'web' ? '🌐' : book.type === 'archive' ? '📦' : '📄';
    const linkText =
      book.type === 'web'
        ? 'Ver curso/web'
        : book.type === 'archive'
          ? 'Ver en Internet Archive'
          : 'Descargar PDF';
    return `
      <article class="book-card">
        <div class="book-header">
          <h3 class="book-title">${book.title}</h3>
          <span class="book-year">${book.year}</span>
        </div>
        <div class="book-author">Por <strong>${book.author}</strong></div>
        <div class="book-university">🏛️ ${book.university} — Edición ${book.edition}</div>
        <div class="book-notes">${book.notes}</div>
        <a href="${book.pdf}" target="_blank" rel="noopener noreferrer" class="book-link">
          ${linkIcon} ${linkText}
        </a>
      </article>
    `;
  }

  render() {
    const booksHtml = bibliography.sections
      .map(
        (section) => `
      <section class="bibliography-section">
        <h2 class="section-title" id="section-${section.id}">${section.title}</h2>
        <p class="section-desc">${section.description}</p>
        <div class="books-grid">
          ${section.books.map((b) => this._renderBook(b)).join('')}
        </div>
      </section>
    `
      )
      .join('');

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .page-header {
          padding: var(--spacing-xl) var(--spacing-lg);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-sm); }
        .page-header p { color: var(--text-secondary); max-width: 800px; }
        .intro-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          font-size: var(--font-size-sm);
          line-height: var(--line-height-relaxed);
          color: var(--text-secondary);
        }
        .bibliography-section { margin-bottom: var(--spacing-2xl); }
        .section-title {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--spacing-md);
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        .section-desc {
          color: var(--text-muted);
          margin-bottom: var(--spacing-lg);
          font-size: var(--font-size-sm);
        }
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }
        .book-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }
        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .book-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--spacing-sm);
        }
        .book-title { font-size: var(--font-size-lg); margin: 0; color: var(--text); }
        .book-year {
          background: var(--primary-100);
          color: var(--primary-800);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        [data-theme="dark"] .book-year {
          background: var(--primary-900);
          color: var(--primary-300);
        }
        .book-author { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs); }
        .book-university { font-size: var(--font-size-xs); color: var(--primary-700); margin-bottom: var(--spacing-sm); }
        [data-theme="dark"] .book-university { color: var(--primary-400); }
        .book-notes { font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--spacing-md); line-height: var(--line-height-relaxed); }
        .book-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: background var(--transition-normal);
          width: 100%;
          justify-content: center;
        }
        .book-link:hover { background: var(--primary-700); }
        .disclaimer {
          margin-top: var(--spacing-2xl);
          padding: var(--spacing-lg);
          background: var(--warning-50);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          line-height: var(--line-height-relaxed);
        }
        [data-theme="dark"] .disclaimer { background: var(--neutral-800); }
        .last-updated {
          margin-top: var(--spacing-md);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-align: right;
        }

        @media (max-width: 640px) {
          .books-grid { grid-template-columns: 1fr; }
          .book-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); }
        }
      </style>

      <header class="page-header">
        <h1>📚 Bibliografía del Curso</h1>
        <p>Referencias académicas utilizadas para diseñar este curso, tomadas de las principales universidades del mundo.</p>
      </header>

      <div class="intro-box">
        ${bibliography.intro}
      </div>

      ${booksHtml}

      <div class="disclaimer">
        <strong>⚠️ Aviso importante:</strong> ${bibliography.disclaimer}
      </div>
      <div class="last-updated">Última actualización: ${bibliography.lastUpdated}</div>
    `;
  }
}

if (!customElements.get('page-bibliography')) {
  customElements.define('page-bibliography', BibliographyPage);
}

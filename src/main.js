// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

import { Router } from './router.js';
import { Store } from './store/index.js';
import { Layout } from './components/layout/Layout.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Footer } from './components/layout/Footer.js';
import './styles/globals.css';

console.log('Imports done');

// Inicializar store global
const store = new Store();
window.__APP_STORE__ = store;
console.log('Store initialized');

// Registrar componentes de layout
customElements.define('app-layout', Layout);
customElements.define('app-header', Header);
customElements.define('app-sidebar', Sidebar);
customElements.define('app-footer', Footer);
console.log('Layout components registered');

// Montar app
const app = document.getElementById('app');
app.innerHTML = `
  <app-layout>
    <app-header slot="header"></app-header>
    <app-sidebar slot="sidebar"></app-sidebar>
    <main slot="main" id="main-content" role="main"></main>
    <app-footer slot="footer"></app-footer>
  </app-layout>
`;
console.log('App mounted');

// Exponer para debugging
window.__APP__ = { store };

console.log('🎓 App initialized successfully');
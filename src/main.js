// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

window.addEventListener('error', function(e) {
  console.error('Global error:', e.error || e.message);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<h1 style="color: red; padding: 20px;">Error: ' + (e.error ? e.error.message : e.message) + '</h1>';
  }
});

import { Router } from './router.js';
import { store } from './store/index.js';
import { Layout } from './components/layout/Layout.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PhasePage } from './pages/PhasePage.js';
import { ModulePage } from './pages/ModulePage.js';
import { LessonPage } from './pages/LessonPage.js';
import { QuizPage } from './pages/QuizPage.js';
import { PracticePage } from './pages/PracticePage.js';
import { DiplomaPage } from './pages/DiplomaPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { LatexRenderer } from './components/math/LatexRenderer.js';
import { InteractiveGraph } from './components/math/InteractiveGraph.js';
import './styles/globals.css';

console.log('Imports done');

// Exponer store global
window.__APP_STORE__ = store;
console.log('Store initialized');

// Registrar componentes de layout (solo si no están registrados)
const registerComponent = (name, ctor) => {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
};

registerComponent('app-layout', Layout);
registerComponent('app-header', Header);
registerComponent('app-sidebar', Sidebar);
registerComponent('app-footer', Footer);
console.log('Layout components registered');

// Registrar páginas
registerComponent('page-home', HomePage);
registerComponent('page-dashboard', DashboardPage);
registerComponent('page-phase', PhasePage);
registerComponent('page-module', ModulePage);
registerComponent('page-lesson', LessonPage);
registerComponent('page-quiz', QuizPage);
registerComponent('page-practice', PracticePage);
registerComponent('page-diploma', DiplomaPage);
registerComponent('page-profile', ProfilePage);
registerComponent('page-settings', SettingsPage);
registerComponent('latex-renderer', LatexRenderer);
registerComponent('interactive-graph', InteractiveGraph);
console.log('Pages registered');

// Configurar rutas
const routes = [
  { path: '/', component: 'page-home', title: 'Inicio' },
  { path: '/dashboard', component: 'page-dashboard', title: 'Panel', auth: true },
  { path: '/phase/:phaseId', component: 'page-phase', title: 'Fase' },
  { path: '/module/:moduleId', component: 'page-module', title: 'Módulo' },
  { path: '/lesson/:lessonId', component: 'page-lesson', title: 'Lección' },
  { path: '/quiz/:quizId', component: 'page-quiz', title: 'Cuestionario' },
  { path: '/practice/:type', component: 'page-practice', title: 'Práctica' },
  { path: '/diploma/:type/:id', component: 'page-diploma', title: 'Diploma' },
  { path: '/profile', component: 'page-profile', title: 'Perfil', auth: true },
  { path: '/settings', component: 'page-settings', title: 'Configuración' }
];

// Inicializar router
const router = new Router(routes, store);
window.__APP_ROUTER__ = router;
console.log('Router initialized');

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

// Escuchar cambios de ruta
router.on('route', ({ component, params, match }) => {
  console.log('Route changed:', component);
  const main = document.getElementById('main-content');
  main.innerHTML = `<${component}></${component}>`;
  const page = main.querySelector(component);
  if (page && page.init) {
    page.init(params, match);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const route = routes.find(r => r.path === match.route);
  document.title = route ? `${route.title} | Matemática Básica` : 'Matemática Básica';
});

// Iniciar router
router.start();
console.log('Router started');

// Exponer para debugging
window.__APP__ = { store, router };

console.log('🎓 App initialized successfully');
// Bootstrap principal - Inicialización de la aplicación
import { Router } from './router.js';
import { Store } from './store/index.js';
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
import './styles/globals.css';

// Inicializar store global
const store = new Store();
window.__APP_STORE__ = store;

// Registrar componentes de layout
customElements.define('app-layout', Layout);
customElements.define('app-header', Header);
customElements.define('app-sidebar', Sidebar);
customElements.define('app-footer', Footer);

// Registrar páginas
customElements.define('page-home', HomePage);
customElements.define('page-dashboard', DashboardPage);
customElements.define('page-phase', PhasePage);
customElements.define('page-module', ModulePage);
customElements.define('page-lesson', LessonPage);
customElements.define('page-quiz', QuizPage);
customElements.define('page-practice', PracticePage);
customElements.define('page-diploma', DiplomaPage);
customElements.define('page-profile', ProfilePage);
customElements.define('page-settings', SettingsPage);

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

// Escuchar cambios de ruta
router.on('route', ({ component, params, match }) => {
  const main = document.getElementById('main-content');
  main.innerHTML = `<${component}></${component}>`;
  const page = main.querySelector(component);
  if (page && page.init) {
    page.init(params, match);
  }
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Update document title
  const route = routes.find(r => r.path === match.route);
  document.title = route ? `${route.title} | Matemática Básica` : 'Matemática Básica';
});

// Iniciar router
router.start();

// Exponer para debugging
window.__APP__ = { store, router };

console.log('🎓 Matemática Básica y Pensamiento Matemático - Iniciado');
// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

// Full version with error handling
(async function() {
try {
  // Import modules
  const { Router } = await import('./router.js');
  console.log('Router imported');
  const { Store } = await import('./store/index.js');
  console.log('Store imported');
  
  // Initialize store
  const store = new Store();
  window.__APP_STORE__ = store;
  console.log('Store initialized');
  
  // Import components
  const { Layout } = await import('./components/layout/Layout.js');
  const { Header } = await import('./components/layout/Header.js');
  const { Sidebar } = await import('./components/layout/Sidebar.js');
  const { Footer } = await import('./components/layout/Footer.js');
  console.log('Layout components imported');
  
  // Import pages
  const { HomePage } = await import('./pages/HomePage.js');
  const { DashboardPage } = await import('./pages/DashboardPage.js');
  const { PhasePage } = await import('./pages/PhasePage.js');
  const { ModulePage } = await import('./pages/ModulePage.js');
  const { LessonPage } = await import('./pages/LessonPage.js');
  const { QuizPage } = await import('./pages/QuizPage.js');
  const { PracticePage } = await import('./pages/PracticePage.js');
  const { DiplomaPage } = await import('./pages/DiplomaPage.js');
  const { ProfilePage } = await import('./pages/ProfilePage.js');
  const { SettingsPage } = await import('./pages/SettingsPage.js');
  console.log('Pages imported');
  
  // Import styles
  await import('./styles/globals.css');
  console.log('Styles imported');
  
  // Register components
  customElements.define('app-layout', Layout);
  customElements.define('app-header', Header);
  customElements.define('app-sidebar', Sidebar);
  customElements.define('app-footer', Footer);
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
  console.log('Components registered');
  
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
} catch (error) {
  console.error('Error initializing app:', error);
  document.getElementById('app').innerHTML = '<h1 style="color: red;">Error: ' + error.message + '</h1>';
}
})();
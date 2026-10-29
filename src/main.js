// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

// Minimal test
const app = document.getElementById('app');
if (app) {
  app.innerHTML = '<h1 style="color: green; font-size: 32px;">Hello from main.js!</h1>';
  console.log('App rendered');
} else {
  console.error('App element not found');
}
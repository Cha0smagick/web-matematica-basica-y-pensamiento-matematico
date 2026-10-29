// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

// Simplified test - just try to import router
(async function() {
try {
  console.log('Starting imports...');
  const { Router } = await import('./router.js');
  console.log('Router imported successfully');
  
  document.getElementById('app').innerHTML = '<h1 style="color: green;">Router imported successfully!</h1>';
} catch (error) {
  console.error('Error:', error);
  document.getElementById('app').innerHTML = '<h1 style="color: red;">Error: ' + error.message + '</h1>';
}
})();
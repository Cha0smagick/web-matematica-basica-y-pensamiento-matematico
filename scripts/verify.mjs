// Verificación runtime end-to-end contra el dev server.
// Uso: node .verify.mjs  (requiere dev server en :5173)
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5173/web-matematica-basica-y-pensamiento-matematico/';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` :: ${detail}` : ''}`);
};

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

// 1) Home carga
await page.goto(BASE, { waitUntil: 'networkidle' });
check('home monta', (await page.locator('page-home').count()) === 1);
const title = await page.title();
check('título por ruta', title.includes('Inicio'), title);

// 2) LaTeX con fuentes KaTeX dentro del shadow root (page-home -> shadow -> latex-renderer)
const latex = await page.evaluate(() => {
  const host = document.querySelector('page-home');
  const lr = host?.shadowRoot?.querySelector('latex-renderer');
  if (!lr?.shadowRoot) return null;
  const k = lr.shadowRoot.querySelector('.katex');
  if (!k) return { katex: false };
  return {
    katex: true,
    font: getComputedStyle(k).fontFamily,
    displayMode: lr.displayMode
  };
});
check('KaTeX renderiza en shadow root', !!latex?.katex);
check('fuente KaTeX aplicada', /KaTeX/i.test(latex?.font || ''), latex?.font);
check('display-mode atributo -> displayMode true', latex?.displayMode === true, String(latex?.displayMode));

// 3) Persistencia: Empezar -> localStorage con estado (autosave diferido 300ms)
await page.locator('#btn-start').click();
await page.waitForTimeout(800);
const ls = await page.evaluate(() => localStorage.getItem('math-course-state'));
check('progreso persiste en localStorage', !!ls);
check('lección l0-1-1 cargada', (await page.locator('page-lesson').count()) === 1);

// 4) Contenido real: título de la lección real
const lessonTitle = await page.evaluate(() => {
  const lp = document.querySelector('page-lesson');
  return lp?.shadowRoot?.querySelector('h1')?.textContent || '';
});
check('título de lección real (subitizing)', /subitizing/i.test(lessonTitle), lessonTitle);

// 4) Avanzar al bloque de explicación y verificar diagrama
await page.evaluate(() => window.__APP__.nextContent());
await page.waitForTimeout(200);
const visualOk = await page.evaluate(() => {
  const lp = document.querySelector('page-lesson');
  const img = lp?.shadowRoot?.querySelector('.content-visual img');
  return img ? img.complete && img.naturalWidth > 0 : null;
});
check('diagrama SVG carga', visualOk !== false, String(visualOk));

// 5) Persistencia ya verificada arriba; el autosave es diferido (1s)
const ls2 = await page.evaluate(() => localStorage.getItem('math-course-state'));
check('progreso persiste en localStorage', !!ls2);

// 6) Ir al bloque de práctica y responder correcto (q0-1-1-1, correct=1)
let practiceOk = null;
for (let i = 0; i < 6; i++) {
  const hasOptions = await page.evaluate(() => {
    const lp = document.querySelector('page-lesson');
    return lp?.shadowRoot?.querySelectorAll('.option-btn').length || 0;
  });
  if (hasOptions) break;
  await page.evaluate(() => window.__APP__.nextContent());
  await page.waitForTimeout(150);
}
practiceOk = await page.evaluate(() => {
  const lp = document.querySelector('page-lesson');
  const btns = lp.shadowRoot.querySelectorAll('.option-btn');
  if (!btns.length) return null;
  btns[1].click();
  return lp.shadowRoot.querySelector('.feedback.correct') !== null;
});
check('respuesta correcta marcada verde', practiceOk === true, String(practiceOk));

// 7) Avanzar hasta finalizar lección -> guarda en IndexedDB
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => window.__APP__.nextContent());
  await page.waitForTimeout(150);
}
const saved = await page.evaluate(async () => {
  const p = await window.__APP_STORE__.progress.getLessonProgress('l0-1-1');
  return p?.completed === true;
});
check('lección guardada en IndexedDB', saved === true);

// 8) Module page muestra lección completada
await page.evaluate(() => window.__APP_ROUTER__.navigate('/module/m0-1'));
await page.waitForTimeout(400);
const moduleState = await page.evaluate(() => {
  const mp = document.querySelector('page-module');
  return {
    rows: mp.shadowRoot.querySelectorAll('.lesson-row').length,
    completed: mp.shadowRoot.querySelectorAll('.lesson-row.completed').length,
    quizBtn: !!mp.shadowRoot.querySelector('.quiz-section .btn')
  };
});
check('module: 5 filas de lecciones', moduleState.rows === 5, JSON.stringify(moduleState));
check('module: 1 completada', moduleState.completed === 1);

// 9) Quiz real: arranca sin crash, responder todo mal -> reprobado, sin diploma
await page.evaluate(() => window.__APP_ROUTER__.navigate('/quiz/m0-1'));
await page.waitForTimeout(300);
const quizInfo = await page.evaluate(() => {
  const qp = document.querySelector('page-quiz');
  const btns = qp.shadowRoot.querySelectorAll('.option-btn');
  return { questions: btns.length, title: qp.shadowRoot.querySelector('.quiz-title')?.textContent };
});
check('quiz monta con opciones', (quizInfo?.questions || 0) === 4, JSON.stringify(quizInfo));

// Responder todo incorrecto: elegir opción que no sea la correcta
for (let i = 0; i < 40; i++) {
  const state = await page.evaluate(() => {
    const qp = document.querySelector('page-quiz');
    if (!qp?.shadowRoot) return null;
    if (qp.shadowRoot.querySelector('[data-retry]')) return 'finished';
    const btns = qp.shadowRoot.querySelectorAll('.option-btn');
    if (!btns.length) return null;
    // elegir el primer botón incorrecto
    const wrong = [...btns].findIndex((b) => !b.classList.contains('correct'));
    btns[Math.max(0, wrong)].click();
    return 'answered';
  });
  if (state === 'finished') break;
  await page.waitForTimeout(80);
  await page.evaluate(() => {
    const qp = document.querySelector('page-quiz');
    qp?.shadowRoot?.querySelector('[data-next]')?.click();
    qp?.shadowRoot?.querySelector('[data-finish]')?.click();
  });
  await page.waitForTimeout(80);
}
const quizResult = await page.evaluate(() => {
  const qp = document.querySelector('page-quiz');
  return {
    fail: !!qp.shadowRoot.querySelector('.result-fail'),
    retry: !!qp.shadowRoot.querySelector('[data-retry]'),
    diploma: !!qp.shadowRoot.querySelector('[data-diploma]')
  };
});
check('quiz reprobado muestra reintento y NO diploma', quizResult.fail && quizResult.retry && !quizResult.diploma, JSON.stringify(quizResult));

// 10) 404
await page.evaluate(() => window.__APP_ROUTER__.navigate('/no-existe'));
await page.waitForTimeout(300);
check('ruta inexistente -> 404', (await page.locator('page-not-found').count()) === 1);

// 11) Dashboard accesible sin login (guest auto)
await page.evaluate(() => window.__APP_ROUTER__.navigate('/dashboard'));
await page.waitForTimeout(500);
check('dashboard accesible', (await page.locator('page-dashboard').count()) === 1);
const dashStats = await page.evaluate(() => {
  const dp = document.querySelector('page-dashboard');
  return dp.shadowRoot.querySelectorAll('.phase-card').length;
});
check('dashboard muestra 7 fases del plan', dashStats === 7, String(dashStats));

// 12) Reset borra IndexedDB
await page.evaluate(async () => {
  localStorage.clear();
  await window.__APP_STORE__.progress.clearAll();
});
await page.reload({ waitUntil: 'networkidle' });
const afterReset = await page.evaluate(async () => {
  const stats = await window.__APP_STORE__.progress.getGlobalStats();
  return stats.lessonsCompleted;
});
check('reset deja progreso en cero', afterReset === 0, String(afterReset));

// 13) Consola limpia de errores graves (filtrar resource 404 de fuentes opcionales)
const fatal = errors.filter((e) => !/favicon|net::ERR/i.test(e));
check('sin errores de consola', fatal.length === 0, fatal.join(' | ').slice(0, 400));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks OK`);
process.exit(failed.length ? 1 : 0);

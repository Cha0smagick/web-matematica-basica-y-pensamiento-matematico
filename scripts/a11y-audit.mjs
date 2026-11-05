// Auditoría de accesibilidad con axe-core sobre las páginas principales.
// Uso: node scripts/a11y-audit.mjs (requiere dev server en :5173)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axeSource = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const BASE = 'http://localhost:5173/web-matematica-basica-y-pensamiento-matematico/';
const ROUTES = ['/', '/lesson/l0-1-1', '/module/m0-1', '/quiz/m0-1', '/dashboard', '/practice/mixed', '/settings', '/legal'];

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
let total = 0;

for (const route of ROUTES) {
  await page.goto(BASE + '#' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(axeSource);
  const results = await page.evaluate(() => {
    const run = window.axe.run(document, {
      // Los shadow roots de componentes ya se analizan; excluir reglas de color
      // que dependen del tema activo si generan ruido conocido
      resultTypes: ['violations']
    });
    return run.then((r) =>
      r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        sample: v.nodes[0]?.target.join(' > ').slice(0, 120) || ''
      }))
    );
  });
  const violations = results.filter((v) => v.impact && v.impact !== 'minor');
  total += violations.reduce((s, v) => s + v.nodes, 0);
  console.log(`\n=== ${route} — ${violations.length} reglas violadas, ${violations.reduce((s, v) => s + v.nodes, 0)} nodos`);
  for (const v of violations) console.log(`  [${v.impact}] ${v.id} x${v.nodes} :: ${v.sample}`);
}

console.log(`\nTOTAL nodos con violación (impacto ≥ moderado): ${total}`);
await browser.close();
process.exit(total ? 1 : 0);

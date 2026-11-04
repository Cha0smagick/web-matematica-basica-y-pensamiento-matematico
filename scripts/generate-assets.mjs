// Genera los diagramas SVG referenciados por el contenido de fase 0.
// Uso: node scripts/generate-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'public/assets';
mkdirSync(OUT, { recursive: true });

const C = {
  blue: '#3b82f6', blueL: '#dbeafe', green: '#16a34a', greenL: '#dcfce7',
  orange: '#f59e0b', orangeL: '#fef3c7', red: '#ef4444', redL: '#fee2e2',
  ink: '#1f2937', muted: '#6b7280', bg: '#ffffff', border: '#d1d5db'
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">` +
  `<rect width="${w}" height="${h}" fill="${C.bg}"/>${body}</svg>`;

const circle = (cx, cy, r, fill = C.blue) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

const label = (x, y, text, size = 16, fill = C.ink, anchor = 'middle', weight = '600') =>
  `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}">${text}</text>`;

// Patrón de puntos como en un dado
function dotsPattern(n, cx, cy, r = 14, gap = 44) {
  const p = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]] }[n] || [];
  return p.map(([dx, dy]) => circle(cx + dx * gap / 2, cy + dy * gap / 2, r)).join('');
}

const files = {};

files['dots-3.svg'] = svg(300, 220, dotsPattern(3, 150, 110) + label(150, 195, '3 puntos', 20));

files['subitizing-dots.svg'] = svg(460, 260, [
  dotsPattern(2, 100, 100), dotsPattern(4, 300, 100),
  dotsPattern(3, 100, 200), dotsPattern(5, 300, 200),
  label(100, 35, '2', 18, C.muted), label(300, 35, '4', 18, C.muted),
  label(100, 245, '3', 18, C.muted), label(300, 245, '5', 18, C.muted)
].join(''));

files['addition-groups.svg'] = svg(520, 220, [
  dotsPattern(2, 90, 100), dotsPattern(3, 240, 100),
  label(160, 110, '+', 34, C.ink), label(330, 110, '=', 34, C.ink),
  dotsPattern(5, 430, 100),
  label(90, 190, '2', 18, C.muted), label(240, 190, '3', 18, C.muted), label(430, 190, '5', 18, C.muted)
].join(''));

files['subtraction-takeaway.svg'] = svg(520, 220, [
  dotsPattern(5, 110, 100),
  circle(240, 80, 16, C.red) + `<line x1="228" y1="68" x2="252" y2="92" stroke="${C.bg}" stroke-width="3"/>` + `<line x1="252" y1="68" x2="228" y2="92" stroke="${C.bg}" stroke-width="3"/>`,
  circle(285, 120, 16, C.red) + `<line x1="273" y1="108" x2="297" y2="132" stroke="${C.bg}" stroke-width="3"/>` + `<line x1="297" y1="108" x2="273" y2="132" stroke="${C.bg}" stroke-width="3"/>`,
  label(200, 110, '→', 30, C.ink),
  dotsPattern(3, 410, 100),
  label(110, 190, '5', 18, C.muted), label(410, 190, 'quedan 3', 16, C.muted)
].join(''));

files['multiplication-arrays.svg'] = svg(520, 260, [
  ...[0, 1, 2].flatMap(row => [0, 1, 2, 3].map(col => circle(80 + col * 60, 90 + row * 60, 16))),
  label(260, 40, '3 filas × 4 columnas = 12', 18),
  label(200, 245, '4 + 4 + 4 = 12', 18, C.muted)
].join(''));

files['division-sharing.svg'] = svg(560, 240, [
  dotsPattern(12, 120, 100),
  label(120, 200, '12 en total', 16, C.muted),
  label(280, 110, '→', 34, C.ink),
  [0, 1, 2].map(g => `<rect x="${320 + g * 70}" y="60" width="56" height="80" rx="10" fill="${C.blueL}" stroke="${C.border}"/>` +
    [0, 1, 2, 3].map(i => circle(348 + g * 70, 80 + i * 18, 9, C.green)).join('')).join(''),
  label(425, 200, '3 grupos de 4', 16, C.muted)
].join(''));

files['correspondence-apples.svg'] = svg(560, 240, [
  [0, 1, 2].map(i => `<text x="${120 + i * 60}" y="90" font-size="34" text-anchor="middle">🍎</text>`).join(''),
  [0, 1, 2].map(i => `<text x="${420 + i * 60}" y="90" font-size="34" text-anchor="middle">🧒</text>`).join(''),
  [0, 1, 2].map(i => `<path d="M${140 + i * 60} 100 C ${240 + i * 60} 130, ${320 + i * 60} 130, ${420 + i * 60} 100" fill="none" stroke="${C.green}" stroke-width="2" stroke-dasharray="4 4"/>`).join(''),
  label(280, 200, 'Cada niño recibe una manzana', 18)
].join(''));

files['cardinality-blocks.svg'] = svg(560, 200, [
  [0, 1, 2, 3, 4].map(i => `<rect x="${70 + i * 90}" y="60" width="70" height="70" rx="8" fill="${C.blueL}" stroke="${C.blue}"/>` + label(105 + i * 90, 105, String(i + 1), 24, C.blue)).join(''),
  label(280, 180, 'Al contar, el último número (5) es la cantidad total', 17)
].join(''));

files['compare-balance.svg'] = svg(560, 260, [
  `<rect x="180" y="120" width="200" height="14" rx="4" fill="${C.ink}"/>` +
  `<rect x="270" y="134" width="20" height="80" fill="${C.ink}"/>` +
  `<rect x="230" y="214" width="100" height="12" rx="4" fill="${C.ink}"/>` +
  `<rect x="120" y="60" width="120" height="40" rx="8" fill="${C.greenL}" stroke="${C.green}"/>` + label(180, 88, '5', 22, C.green),
  `<rect x="320" y="80" width="120" height="40" rx="8" fill="${C.redL}" stroke="${C.red}"/>` + label(380, 108, '3', 22, C.red),
  `<path d="M120 80 L180 110 L240 80" fill="none" stroke="${C.ink}" stroke-width="3"/>`,
  label(180, 30, 'grupo A: 5', 16, C.muted), label(420, 30, 'grupo B: 3', 16, C.muted),
  label(280, 245, 'A > B: el lado con 5 pesa más', 18)
].join(''));

files['fraction-pizza.svg'] = svg(420, 300, [
  `<circle cx="150" cy="140" r="100" fill="${C.orangeL}" stroke="${C.orange}" stroke-width="3"/>`,
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const a1 = (i * 45 - 90) * Math.PI / 180, a2 = ((i + 1) * 45 - 90) * Math.PI / 180;
    const fill = i < 3 ? C.orange : C.bg;
    const x1 = 150 + 98 * Math.cos(a1), y1 = 140 + 98 * Math.sin(a1);
    const x2 = 150 + 98 * Math.cos(a2), y2 = 140 + 98 * Math.sin(a2);
    return `<path d="M150 140 L${x1} ${y1} A98 98 0 0 1 ${x2} ${y2} Z" fill="${fill}" stroke="${C.orange}" stroke-width="2"/>`;
  }).join(''),
  label(150, 280, '3 de 8 partes = 3/8', 20),
  label(330, 140, 'numerador: partes', 14, C.muted, 'middle'),
  label(330, 165, 'tomadas = 3', 14, C.muted, 'middle')
].join(''));

files['fraction-numberline.svg'] = svg(560, 180, [
  `<line x1="60" y1="90" x2="500" y2="90" stroke="${C.ink}" stroke-width="3"/>`,
  `<path d="M500 90 L486 83 L486 97 Z" fill="${C.ink}"/>`,
  [0, 0.25, 0.5, 0.75, 1].map((t, i) => {
    const x = 60 + t * 440;
    return `<line x1="${x}" y1="80" x2="${x}" y2="100" stroke="${C.ink}" stroke-width="2"/>` +
      label(x, 125, i === 0 ? '0' : i === 4 ? '1' : ['1/4', '1/2', '3/4'][i - 1], 16, C.blue);
  }).join(''),
  label(280, 165, 'Las fracciones son números entre los enteros', 16, C.muted)
].join(''));

files['equivalent-fractions.svg'] = svg(620, 260, [
  ...[0, 1, 2].map(k => {
    const cx = 110 + k * 200, n = [2, 4, 8][k], filled = [1, 2, 4][k];
    return `<circle cx="${cx}" cy="110" r="80" fill="${C.bg}" stroke="${C.orange}" stroke-width="3"/>` +
      [...Array(n)].map((_, i) => {
        const a1 = (i * 360 / n - 90) * Math.PI / 180, a2 = ((i + 1) * 360 / n - 90) * Math.PI / 180;
        const fill = i < filled ? C.orange : C.bg;
        return `<path d="M${cx} 110 L${cx + 78 * Math.cos(a1)} ${110 + 78 * Math.sin(a1)} A78 78 0 0 1 ${cx + 78 * Math.cos(a2)} ${110 + 78 * Math.sin(a2)} Z" fill="${fill}" stroke="${C.orange}" stroke-width="1.5"/>`;
      }).join('');
  }).join(''),
  label(110, 235, '1/2', 20), label(310, 235, '2/4', 20), label(510, 235, '4/8', 20),
  label(310, 30, 'Formas distintas, misma cantidad', 17, C.muted)
].join(''));

files['compare-fractions.svg'] = svg(560, 260, [
  label(140, 40, '3/8', 22, C.ink), label(420, 40, '3/5', 22, C.ink),
  `<rect x="60" y="60" width="160" height="40" rx="6" fill="${C.bg}" stroke="${C.border}"/>` +
    `<rect x="60" y="60" width="60" height="40" rx="6" fill="${C.blue}"/>` +
    [...Array(7)].map((_, i) => `<line x1="${80 + i * 20}" y1="60" x2="${80 + i * 20}" y2="100" stroke="${C.bg}" stroke-width="2"/>`).join(''),
  `<rect x="340" y="60" width="160" height="40" rx="6" fill="${C.bg}" stroke="${C.border}"/>` +
    `<rect x="340" y="60" width="96" height="40" rx="6" fill="${C.green}"/>` +
    [...Array(4)].map((_, i) => `<line x1="${372 + i * 32}" y1="60" x2="${372 + i * 32}" y2="100" stroke="${C.bg}" stroke-width="2"/>`).join(''),
  label(280, 190, '<', 40, C.ink),
  label(280, 235, 'Mismo numerador: menor denominador = mayor fracción', 16, C.muted)
].join(''));

files['fraction-real-life.svg'] = svg(560, 260, [
  `<circle cx="150" cy="120" r="80" fill="${C.bg}" stroke="${C.ink}" stroke-width="3"/>`,
  `<line x1="150" y1="120" x2="150" y2="60" stroke="${C.ink}" stroke-width="4"/>`,
  `<line x1="150" y1="120" x2="200" y2="120" stroke="${C.blue}" stroke-width="4"/>`,
  label(150, 235, '1/2 hora = 30 min', 17),
  `<path d="M330 60 h100 v90 a50 40 0 0 1 -100 0 Z" fill="${C.blueL}" stroke="${C.blue}" stroke-width="2"/>`,
  `<path d="M330 105 h100 v45 a50 40 0 0 1 -100 0 Z" fill="${C.blue}" opacity="0.75"/>`,
  label(380, 235, '1/2 taza', 17)
].join(''));

files['decimal-grid.svg'] = svg(420, 340, [
  ...Array.from({ length: 100 }, (_, i) => {
    const x = 60 + (i % 10) * 30, y = 50 + Math.floor(i / 10) * 30;
    return `<rect x="${x}" y="${y}" width="30" height="30" fill="${i < 50 ? C.blue : C.blueL}" stroke="${C.bg}" stroke-width="1"/>`;
  }).join(''),
  `<rect x="60" y="50" width="300" height="300" fill="none" stroke="${C.border}"/>`,
  label(210, 25, '50 de 100 cuadros = 0.5', 18),
  label(210, 390, '0.5 = 5/10 = 1/2', 20, C.blue)
].join(''));

files['percent-hundred.svg'] = svg(420, 340, [
  ...Array.from({ length: 100 }, (_, i) => {
    const x = 60 + (i % 10) * 30, y = 50 + Math.floor(i / 10) * 30;
    return `<rect x="${x}" y="${y}" width="30" height="30" fill="${i < 25 ? C.green : C.greenL}" stroke="${C.bg}" stroke-width="1"/>`;
  }).join(''),
  `<rect x="60" y="50" width="300" height="300" fill="none" stroke="${C.border}"/>`,
  label(210, 25, '25 de cada 100 = 25%', 18),
  label(210, 390, '25% = 25/100 = 1/4', 20, C.green)
].join(''));

files['conversion-triangle.svg'] = svg(480, 320, [
  `<path d="M240 60 L100 250 L380 250 Z" fill="${C.blueL}" stroke="${C.blue}" stroke-width="3"/>`,
  label(240, 50, 'Fracción', 20, C.blue),
  label(85, 280, 'Decimal', 20, C.green, 'start'),
  label(395, 280, 'Porcentaje', 20, C.orange, 'end'),
  label(150, 170, '÷10 → ×10', 15, C.muted, 'middle', '500'),
  label(300, 170, '×100 → ÷100', 15, C.muted, 'middle', '500'),
  label(240, 205, '1/2 = 0.5 = 50%', 19, C.ink)
].join(''));

files['percent-money.svg'] = svg(520, 260, [
  `<rect x="80" y="70" width="200" height="120" rx="12" fill="${C.greenL}" stroke="${C.green}" stroke-width="2"/>`,
  label(180, 145, '$1000', 30, C.green),
  `<rect x="320" y="70" width="140" height="120" rx="12" fill="${C.orangeL}" stroke="${C.orange}" stroke-width="2"/>`,
  label(390, 120, '−20%', 22, C.orange),
  label(390, 160, '$800', 26, C.ink),
  label(260, 235, 'Descuento: 0.20 × 1000 = $200', 18, C.muted)
].join(''));

files['rule-of-three.svg'] = svg(520, 240, [
  `<rect x="60" y="60" width="120" height="60" rx="10" fill="${C.blueL}" stroke="${C.blue}"/>`,
  `<rect x="340" y="60" width="120" height="60" rx="10" fill="${C.greenL}" stroke="${C.green}"/>`,
  `<rect x="60" y="160" width="120" height="60" rx="10" fill="${C.blueL}" stroke="${C.blue}"/>`,
  `<rect x="340" y="160" width="120" height="60" rx="10" fill="${C.orangeL}" stroke="${C.orange}" stroke-dasharray="5 4"/>`,
  label(120, 97, '5 manzanas', 15), label(400, 97, '8 manzanas', 15),
  label(120, 197, '$100', 15), label(400, 197, '$?', 20, C.orange),
  label(260, 105, '↑', 22, C.muted), label(260, 215, '↑', 22, C.muted),
  label(260, 40, 'X = (100 × 8) / 5 = $160', 18)
].join(''));

files['operations-map.svg'] = svg(620, 300, [
  [['+', 'Suma', 'juntar', C.blue, 90, 80], ['−', 'Resta', 'quitar o comparar', C.red, 330, 80],
   ['×', 'Multiplicación', 'grupos iguales', C.orange, 90, 200], ['÷', 'División', 'repartir igual', C.green, 330, 200]]
    .map(([sym, name, desc, color, x, y]) =>
      `<rect x="${x}" y="${y}" width="200" height="90" rx="14" fill="${C.bg}" stroke="${color}" stroke-width="3"/>` +
      label(x + 30, y + 55, sym, 38, color, 'middle') +
      label(x + 70, y + 35, name, 17, C.ink, 'start') +
      label(x + 70, y + 62, desc, 13, C.muted, 'start', '400')
    ).join(''),
  label(310, 30, 'Identificar la operación es más importante que calcular', 16, C.muted)
].join(''));

files['ordinal-race.svg'] = svg(620, 220, [
  `<line x1="40" y1="160" x2="580" y2="160" stroke="${C.border}" stroke-width="3"/>`,
  ...[0, 1, 2, 3, 4].map(i => {
    const x = 110 + i * 100;
    return `<text x="${x}" y="130" font-size="30" text-anchor="middle">🏃</text>` +
      label(x, 190, `${i + 1}º`, 18, i === 0 ? C.orange : C.muted);
  }).join(''),
  label(110, 40, 'El orden importa: 1º, 2º, 3º…', 18)
].join(''));

for (const [name, content] of Object.entries(files)) {
  writeFileSync(`${OUT}/${name}`, content, 'utf8');
}

console.log(`Generados ${Object.keys(files).length} diagramas en ${OUT}/`);

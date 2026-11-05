// Validación de contenido: JSON válido, respuestas en rango y assets existentes.
// npm test
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// .../src/courses/math-fundamentals -> raíz del proyecto (3 niveles arriba)
const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const PHASES_DIR = resolve(ROOT, 'src/courses/math-fundamentals/phases');
const MODULE_IDS = ['m0-1', 'm0-2', 'm0-3', 'm0-4'];

const modules = Object.fromEntries(
  MODULE_IDS.map((id) => [id, JSON.parse(readFileSync(`${PHASES_DIR}/${id}.json`, 'utf8'))])
);

describe('Contenido del curso', () => {
  it('todos los módulos tienen lessons como array', () => {
    for (const [id, mod] of Object.entries(modules)) {
      expect(Array.isArray(mod.lessons), `${id}.lessons debe ser array`).toBe(true);
      expect(mod.lessons.length, `${id} debe tener lecciones`).toBeGreaterThan(0);
    }
  });

  it('cada opción correcta está dentro de rango (0 <= correct < options.length)', () => {
    const bad = [];
    for (const mod of Object.values(modules)) {
      for (const lesson of mod.lessons) {
        for (const block of lesson.content || []) {
          for (const q of block.questions || []) {
            if (Array.isArray(q.options)) {
              if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) {
                bad.push(`${q.id} (correct=${q.correct}, options=${q.options.length})`);
              }
            }
          }
        }
      }
    }
    expect(bad, `respuestas fuera de rango: ${bad.join(', ')}`).toEqual([]);
  });

  it('no hay preguntas con varias respuestas válidas marcadas como única correcta', () => {
    // q0-2-3-1 tenía dos opciones válidas; esta guarda evita regresiones conocidas
    const q = modules['m0-2'].lessons
      .flatMap((l) => l.content || [])
      .flatMap((b) => b.questions || [])
      .find((q) => q.id === 'q0-2-3-1');
    expect(q.options.filter((o) => o === '4 + 4 + 4').length).toBe(1);
    expect(q.options).not.toContain('3 + 3 + 3 + 3');
  });

  it('cada lesson tiene id, title y objective', () => {
    for (const [modId, mod] of Object.entries(modules)) {
      for (const lesson of mod.lessons) {
        expect(lesson.id, `${modId} lección sin id`).toBeTruthy();
        expect(lesson.title, `${lesson.id} sin título`).toBeTruthy();
        expect(lesson.objective, `${lesson.id} sin objetivo`).toBeTruthy();
      }
    }
  });

  it('los ids de lección son únicos en todo el curso', () => {
    const ids = Object.values(modules).flatMap((m) => m.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Assets referenciados', () => {
  it('cada visual/image existe en public/', () => {
    const missing = [];
    for (const mod of Object.values(modules)) {
      for (const lesson of mod.lessons) {
        for (const block of lesson.content || []) {
          const refs = [block.visual, block.image, ...(block.questions || []).map((q) => q.image)];
          for (const ref of refs.filter(Boolean)) {
            if (!existsSync(resolve(ROOT, 'public', ref))) {missing.push(ref);}
          }
        }
      }
    }
    expect(missing, `assets faltantes: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('Manifest', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(ROOT, 'src/courses/math-fundamentals/manifest.json'), 'utf8')
  );

  it('los totales coinciden con el contenido real en disco', () => {
    const real = {
      modules: Object.keys(modules).length,
      lessons: Object.values(modules).reduce((s, m) => s + m.lessons.length, 0)
    };
    expect(manifest.achievements.totalModules).toBe(real.modules);
    expect(manifest.achievements.totalLessons).toBe(real.lessons);
  });

  it('solo fases con contenido en disco están marcadas como disponibles', () => {
    for (const phase of manifest.phases) {
      const hasContent = phase.modules.some((m) => modules[m]);
      expect(phase.available, `${phase.id} available debe ser ${hasContent}`).toBe(hasContent);
    }
  });
});

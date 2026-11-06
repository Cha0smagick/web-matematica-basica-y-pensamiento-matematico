// Acceso único al contenido real del curso.
// Los datos son la fuente de verdad: cualquier cifra que se muestre se deriva de aquí.
import manifest from './manifest.json';

// Fase 0
import phase0 from './phases/phase-0.json';
import m01 from './phases/m0-1.json';
import m02 from './phases/m0-2.json';
import m03 from './phases/m0-3.json';
import m04 from './phases/m0-4.json';

// Fase 1
import phase1 from './phases/phase-1.json';
import m11 from './phases/m1-1.json';
import m12 from './phases/m1-2.json';
import m13 from './phases/m1-3.json';
import m14 from './phases/m1-4.json';

// Fase 2
import phase2 from './phases/phase-2.json';
import m21 from './phases/m2-1.json';
import m22 from './phases/m2-2.json';
import m23 from './phases/m2-3.json';
import m24 from './phases/m2-4.json';

// Fase 3
import phase3 from './phases/phase-3.json';
import m31 from './phases/m3-1.json';
import m32 from './phases/m3-2.json';
import m33 from './phases/m3-3.json';
import m34 from './phases/m3-4.json';

// Fase 4
import phase4 from './phases/phase-4.json';
import m41 from './phases/m4-1.json';
import m42 from './phases/m4-2.json';
import m43 from './phases/m4-3.json';
import m44 from './phases/m4-4.json';

// Fase 5
import phase5 from './phases/phase-5.json';
import m51 from './phases/m5-1.json';
import m52 from './phases/m5-2.json';
import m53 from './phases/m5-3.json';
import m54 from './phases/m5-4.json';

// Fase 6
import phase6 from './phases/phase-6.json';
import m61 from './phases/m6-1.json';
import m62 from './phases/m6-2.json';
import m63 from './phases/m6-3.json';
import m64 from './phases/m6-4.json';

const moduleFiles = {
  'm0-1': m01,
  'm0-2': m02,
  'm0-3': m03,
  'm0-4': m04,
  'm1-1': m11,
  'm1-2': m12,
  'm1-3': m13,
  'm1-4': m14,
  'm2-1': m21,
  'm2-2': m22,
  'm2-3': m23,
  'm2-4': m24,
  'm3-1': m31,
  'm3-2': m32,
  'm3-3': m33,
  'm3-4': m34,
  'm4-1': m41,
  'm4-2': m42,
  'm4-3': m43,
  'm4-4': m44,
  'm5-1': m51,
  'm5-2': m52,
  'm5-3': m53,
  'm5-4': m54,
  'm6-1': m61,
  'm6-2': m62,
  'm6-3': m63,
  'm6-4': m64,
};

const phaseFiles = {
  'phase-0': phase0,
  'phase-1': phase1,
  'phase-2': phase2,
  'phase-3': phase3,
  'phase-4': phase4,
  'phase-5': phase5,
  'phase-6': phase6,
};

export const courseManifest = manifest;

export function getPhase(phaseId) {
  const phase = manifest.phases.find((p) => p.id === phaseId);
  if (!phase) {
    return null;
  }
  return { ...phase, ...(phaseFiles[phaseId] || {}) };
}

export function getModule(moduleId) {
  return moduleFiles[moduleId] || null;
}

export function getLessons(moduleId) {
  return moduleFiles[moduleId]?.lessons || [];
}

export function getLesson(lessonId) {
  for (const mod of Object.values(moduleFiles)) {
    const lesson = (mod.lessons || []).find((l) => l.id === lessonId);
    if (lesson) {
      return { lesson, module: mod };
    }
  }
  return null;
}

export function getPhaseModules(phaseId) {
  const phase = manifest.phases.find((p) => p.id === phaseId);
  return (phase?.modules || []).map((id) => moduleFiles[id]).filter(Boolean);
}

export function isPhaseAvailable(phaseId) {
  return getPhaseModules(phaseId).length > 0;
}

export function getQuizQuestions(moduleId) {
  const mod = moduleFiles[moduleId];
  if (!mod) {
    return [];
  }
  return (mod.lessons || []).flatMap((lesson) =>
    (lesson.content || []).flatMap((block) =>
      (block.questions || []).filter((q) => Array.isArray(q.options))
    )
  );
}

export function getCourseStats() {
  const modules = Object.values(moduleFiles);
  const lessons = modules.flatMap((m) => m.lessons || []);
  const questions = modules.flatMap((m) =>
    (m.lessons || []).flatMap((l) => (l.content || []).flatMap((c) => c.questions || []))
  );
  const availablePhases = new Set(modules.map((m) => m.phaseId));
  return {
    phases: availablePhases.size,
    modules: modules.length,
    lessons: lessons.length,
    questions: questions.length,
  };
}

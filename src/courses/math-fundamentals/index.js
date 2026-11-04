// Acceso único al contenido real del curso.
// Los datos son la fuente de verdad: cualquier cifra que se muestre se deriva de aquí.
import manifest from './manifest.json';
import phase0 from './phases/phase-0.json';
import m01 from './phases/m0-1.json';
import m02 from './phases/m0-2.json';
import m03 from './phases/m0-3.json';
import m04 from './phases/m0-4.json';

const moduleFiles = {
  'm0-1': m01,
  'm0-2': m02,
  'm0-3': m03,
  'm0-4': m04
};

const phaseFiles = {
  'phase-0': phase0
};

export const courseManifest = manifest;

export function getPhase(phaseId) {
  const phase = manifest.phases.find(p => p.id === phaseId);
  if (!phase) {return null;}
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
    const lesson = (mod.lessons || []).find(l => l.id === lessonId);
    if (lesson) {return { lesson, module: mod };}
  }
  return null;
}

export function getPhaseModules(phaseId) {
  const phase = manifest.phases.find(p => p.id === phaseId);
  return (phase?.modules || []).map(id => moduleFiles[id]).filter(Boolean);
}

export function isPhaseAvailable(phaseId) {
  return getPhaseModules(phaseId).length > 0;
}

export function getQuizQuestions(moduleId) {
  const mod = moduleFiles[moduleId];
  if (!mod) {return [];}
  return (mod.lessons || []).flatMap(lesson =>
    (lesson.content || []).flatMap(block =>
      (block.questions || []).filter(q => Array.isArray(q.options))
    )
  );
}

export function getCourseStats() {
  const modules = Object.values(moduleFiles);
  const lessons = modules.flatMap(m => m.lessons || []);
  const questions = modules.flatMap(m =>
    (m.lessons || []).flatMap(l => (l.content || []).flatMap(c => c.questions || []))
  );
  const availablePhases = new Set(modules.map(m => m.phaseId));
  return {
    phases: availablePhases.size,
    modules: modules.length,
    lessons: lessons.length,
    questions: questions.length
  };
}

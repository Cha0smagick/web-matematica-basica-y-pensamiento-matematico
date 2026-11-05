# Auditoría integral — Matemática Básica y Pensamiento Matemático

**Fecha:** 2026-11-04
**Auditor:** Adeptus Vinictus II
**Alcance:** repositorio completo, build, runtime real (Chromium/Playwright), contenido, LaTeX, UX, accesibilidad, SEO/PWA, legal, seguridad y dependencias.
**Método:** lectura estática (`file:line`) + ejecución real del servidor de desarrollo y del build de producción, con verificación en navegador. Nada aquí está inferido sin evidencia; lo que no pude verificar se marca explícitamente.

---

## Veredicto en una línea

**El sitio no es desplegable.** No arranca en producción por un import roto, el quiz truena al entrar, el LaTeX se renderiza sin tipografía matemática, el progreso no se guarda, y el contenido prometido (6 fases / 24 módulos / 180 lecciones) es en realidad **1 fase / 4 módulos / 20 lecciones**, de las cuales solo hay lecciones reales para 4 módulos. El resto es andamiaje vacío.

---

## Tabla de severidad

| Nivel | Significado | Cantidad |
|---|---|---|
| **P0 — Bloqueante** | Impide usar el sitio o entrega datos falsos/inseguros | 12 |
| **P1 — Grave** | Funciona a medias, rompe confianza o experiencia | 18 |
| **P2 — Menor** | Calidad, mantenibilidad, pulido | 14 |

Orden sugerido de ataque: **P0 completo → P1 de contenido/LaTeX → P1 de persistencia/routing → P2**.

---

# P0 — Bloqueantes

## P0-01 — Import de `qrcode` rompe el arranque en producción

- **Evidencia:** `src/pages/DiplomaPage.js:3` (`import QRCode from 'qrcode';`).
- **Síntoma real:** `The requested module '.../qrcode/lib/browser.js' does not provide an export named 'default'`. Al quitarlo, aparece `require is not defined` (el paquete arrastra CJS incompatível con el bundle ESM).
- **Impacto:** la app no monta. Pantalla en blanco. Es el bloqueante número uno.
- **Solución:** eliminar el import si no se usa (en el código actual `QRCode` no se referencia en ningún método), o reemplazar por `qrcode` generado en un worker/`import('qrcode')` dinámico. La opción más limpia: **borrar el import** y, si se quiere QR real, usar la API `toDataURL` en un módulo aislado.
- **Verificación:** `npm run build && npm run preview`, abrir `/diploma/...`; consola sin errores, diploma visible.

## P0-02 — Quiz truena garantizado al entrar (orden de inicialización invertido)

- **Evidencia:** `src/pages/QuizPage.js:16-17`.
  ```js
  this.render();       // render() lee this._questions[this._currentQuestion]
  this._startQuiz();   // aquí recién se llenan las preguntas
  ```
- **Síntoma real:** `Cannot read properties of undefined (reading 'question')` y luego `Cannot set properties of null (setting 'innerHTML')` porque el handler global reemplaza `#app`.
- **Impacto:** ninguna evaluación funciona. Además, el crash deja la SPA inutilizable hasta recargar.
- **Solución:** llamar `this._startQuiz()` **antes** de `this.render()`, o hacer que `render()` tolere `_questions` vacío. Corregir el orden es suficiente.
- **Verificación:** navegar a `/quiz/m0-1`; debe mostrar la primera pregunta sin errores en consola.

## P0-03 — El handler global de errores destruye la app

- **Evidencia:** `src/main.js:4-9`.
  ```js
  window.addEventListener('error', function (e) {
    ...
    app.innerHTML = '<h1 ...>Error: ' + ... ;
  });
  ```
- **Impacto:** cualquier error de runtime sustituye todo `#app` por un `<h1>`, borrando la SPA. El usuario no puede volver atrás ni navegar sin recargar. Convierte un error recuperable en una pantalla muerta.
- **Solución:** no sobrescribir `#app`. Registrar el error (consola + telemetría opcional) y mostrar un banner no destructivo o un componente de error aislado.
- **Verificación:** provocar un error en consola; la app sigue navegable.

## P0-04 — LaTeX no se renderiza correctamente (sin CSS de KaTeX en Shadow DOM)

- **Evidencia:** `src/components/math/LatexRenderer.js`. El componente usa Shadow DOM con estilos propios, pero **no inyecta la hoja de estilos de KaTeX** (`katex/dist/katex.min.css`).
- **Pruebas reales:**
  - El shadow root solo contiene el `<style>` inline del componente; no hay stylesheet de KaTeX.
  - Con `display-mode` seteado, `el.displayMode === false` (el atributo se escribe mal, ver P1-01).
  - La fuente computada del `.katex` es `Inter...`, no `KaTeX_Main`.
  - `.mfrac` computa `display:inline` en lugar de `inline-block`/`block`.
- **Impacto:** exactamente el síntoma que reporta el usuario: “las fórmulas no se ven bien”. Sin el CSS, KaTeX produce el HTML correcto pero sin métricas, fuentes ni layout matemático. Se ve como texto roto.
- **Solución:** cargar `katex.min.css` dentro del shadow root, por ejemplo:
  ```js
  const katexCSS = document.createElement('link');
  katexCSS.rel = 'stylesheet';
  katexCSS.href = `${import.meta.env.BASE_URL}node_modules/katex/dist/katex.min.css`; // o importar el CSS y serializarlo con ?inline
  ```
  Alternativa robusta: `import katexCss from 'katex/dist/katex.min.css?inline'` (Vite) y meterlo en el `<style>` del shadow root. Es la vía recomendada porque sobrevive al bundling.
- **Verificación:** `.katex` computa `font-family: KaTeX_Main`; una fracción se ve apilada; una integral y un sumatorio alinean límites.

## P0-05 — El progreso nunca se persiste (nested `set()` no notifica ni autosave)

- **Evidencia:** `src/store/index.js:71` (`set(path, value)` anida sin disparar `_notify` ni el autosave), `src/store/index.js:139-151` (autosave suscrito a `''`, que nunca recibe notificación de cambios anidados).
- **Prueba real:** tras pulsar “Empezar”, `localStorage.getItem('math-course-state')` es `NULL`.
- **Impacto:** el curso no recuerda nada. Recargar = progreso perdido. Es un fallo de producto total para un curso.
- **Solución:** en `set(path, value)`, tras escribir, llamar `this._notify(path, value)` y `this._notify('', this.state)` (o emitir un evento global `state:change`). Asegurar que el autosave escuche ese evento. Añadir una prueba mínima: set anidado → localStorage cambia.
- **Verificación:** completar una lección, recargar, el estado persiste.

## P0-06 — `reset()` no borra IndexedDB: el progreso “resucita”

- **Evidencia:** `src/store/index.js:181-184` solo borra claves de `localStorage`; `src/store/progress.js` guarda el progreso real en IndexedDB (Dexie). `ProgressStore.reset()` existe (usa `db.delete()`), pero no se invoca desde el reset global.
- **Impacto:** el usuario “borra todo” y al recargar reaparece el progreso. Rompe confianza y puede exponer datos que creía eliminados.
- **Solución:** `async reset()` debe `await progress.reset()` (o `db.delete()`) además de limpiar `localStorage`. Convertir el reset en asíncrono y esperar antes de redirigir.
- **Verificación:** reset → recargar → dashboard en cero.

## P0-07 — Respuestas de matemáticas corruptas (índices fuera de rango y marcas erróneas)

- **Evidencia:** datos en `src/courses/math-fundamentals/phases/m0-1.json`, `m0-2.json`.
- **Casos confirmados:**

| Pregunta | Opciones | `correct` | Problema |
|---|---|---|---|
| `q0-1-1-1` | `[2,3,4,5]` | `3` | marca 5 (índice 3) pero el feedback dice 3 |
| `q0-1-3-1` | `["3","4","5","6"]` | `4` | fuera de rango; debía ser índice 1 |
| `q0-2-1-1` | `["4","5","6","7"]` | `5` | fuera de rango; debía ser índice 1 |
| `q0-2-2-1` | `["2","3","4","7"]` | `3` | marca 7; debía ser índice 1 (valor 3) |
| `q0-2-4-1` | `["3","4","36","9"]` | `4` | fuera de rango; debía ser índice 1 |
| `q0-2-3-1` | — | `1` | `4+4+4` y `3+3+3+3` son ambas válidas; una correcta se marca mal |

- **Impacto:** el alumno responde bien y el sistema lo reprueba, o al revés. Destruye el valor pedagógico.
- **Solución:** definir una convención única y documentada (`correct` = índice 0-based del array `options`) y auditar **todas** las preguntas con un script de validación que verifique `0 <= correct < options.length`. Para preguntas con múltiples respuestas válidas, cambiar el esquema a `correct: [1,2]` o reformular la pregunta.
- **Verificación:** script de validación en CI que falle si algún `correct` está fuera de rango o si la pregunta es ambigua.

## P0-08 — JSON inválido en `m0-4.json`

- **Evidencia:** `src/courses/math-fundamentals/phases/m0-4.json:116-117` (coma final).
- **Impacto:** cualquier `JSON.parse` de esa fase lanza y rompe la carga del módulo. Cualquier import/build que lo procese puede fallar.
- **Solución:** eliminar la coma final. Añadir validación JSON al pipeline (script `validate:content`).
- **Verificación:** `node -e "JSON.parse(require('fs').readFileSync('src/courses/math-fundamentals/phases/m0-4.json'))"` sin error.

## P0-09 — Clave `"lessons"` duplicada en `m0-1.json`

- **Evidencia:** `src/courses/math-fundamentals/phases/m0-1.json` (dos claves `lessons` a nivel superior).
- **Impacto:** JSON.parse se queda con la última; la primera se pierde silenciosamente. Contenido invisible y comportamiento impredecible.
- **Solución:** fusionar ambas listas en una sola clave. Validación de duplicados de clave en el script de contenido.
- **Verificación:** un solo `lessons` tras parseo; el conteo coincide con el esperado.

## P0-10 — El manifest promete 6 fases / 24 módulos / 180 lecciones; solo existe la fase 0

- **Evidencia:** `src/courses/math-fundamentals/manifest.json` declara fases 0–6, 24 módulos y `totalLessons: 180`. En disco solo hay `phases/m0-1.json`..`m0-4.json` y `phase-0.json`.
- **Además:** el manifest se contradice internamente: dice 6 fases y `totalPhases: 6`, pero lista 7 (0–6); dice 24 módulos pero el objeto `modules` tiene 28; dice 180 lecciones pero la suma declarada da 190.
- **Impacto:** es publicidad falsa en el propio producto. El alumno avanza y se topa con un muro. Los badges y el “DIPLOMA DE HONOR” son inalcanzables.
- **Solución:** dos caminos válidos:
  1. **Honesto:** publicar solo la fase 0 como “beta” y marcar el resto “próximamente”, ocultando diplomas inalcanzables.
  2. **Completar:** generar el contenido faltante antes de prometerlo.
  En ambos casos, los números del manifest deben derivarse de los archivos reales, no escribirse a mano.
- **Verificación:** un script cuenta fases/módulos/lecciones en disco y compara con el manifest; debe coincidir.

## P0-11 — El diploma se autoproclama “oficial” y “verificable” sin verificación real

- **Evidencia:** `src/pages/DiplomaPage.js:89-102, 154-157`. El botón “Verificar” hace `alert('...en producción esto consultaría un servidor...')`. El hash `verificationHash` no se persiste ni se puede consultar en ningún lado.
- **Impacto:** fraude/documento engañoso. Un diploma que dice “Certificado Oficial” y “verificable” cuando la verificación es un `alert` local es un problema legal y de confianza.
- **Solución:** mientras no exista backend, quitar “Oficial” y “verificable”, y rotular como “constancia de finalización” con hash local reproducible (p. ej. SHA-256 de `{curso, alumno, fecha, puntaje}` calculado en cliente y mostrado, sin prometer validación externa). Si se quiere verificación real, requiere backend + registro.
- **Verificación:** el texto del diploma no promete nada que el código no cumpla.

## P0-12 — Crash de arranque por `match.route` inexistente + handler que borra la app (interacción P0-02/P0-03)

- **Evidencia:** `src/main.js:109-110` busca `routes.find(r => r.path === match.route)`, pero `match` es el resultado de un matcher que no expone `route` como path literal en todos los casos.
- **Impacto:** `document.title` nunca cambia (siempre “Matemática Básica”), y cualquier consumidor de `match.route` recibe `undefined`. Combinado con P0-03, agrava el crash.
- **Solución:** hacer que el matcher devuelva `{ route, params }` (o el objeto de ruta completo) y usar `match.route.title`. Verificar en navegador que el título cambia al navegar.
- **Verificación:** navegar entre páginas y comprobar `document.title`.

---

# P1 — Graves

## P1-01 — `LatexRenderer` escribe el atributo equivocado (`display-mode` → `_displaymode`)

- **Evidencia:** `src/components/math/LatexRenderer.js`.
- **Síntoma:** con `display-mode` seteado, `el.displayMode === false`.
- **Solución:** usar `observedAttributes = ['display-mode', 'latex', ...]` y leer `this.getAttribute('display-mode')`; mapear a la opción `displayMode` de KaTeX.
- **Verificación:** `display-mode` produce bloque centrado y `displayMode: true` en KaTeX.

## P1-02 — Tooltip de LaTeX con tokens desalineados

- **Evidencia:** `src/components/math/LatexRenderer.js` (el tooltip usa un token/placeholder distinto al que genera el HTML).
- **Solución:** unificar el contrato del token; añadir prueba que verifique que el tooltip aparece al hacer hover.
- **Verificación:** hover sobre una fórmula muestra explicación.

## P1-03 — Todos los botones se ven como botones nativos grises (CSS global no entra al Shadow DOM)

- **Evidencia:** estilos globales (`.btn`, etc.) en `src/styles/`, componentes con Shadow DOM.
- **Síntoma real:** botones `display:block`, `outset`, fondo gris del navegador.
- **Solución:** mover los estilos base a una hoja compartida (`adoptedStyleSheets`) que cada componente adopte, o definir estilos dentro de cada shadow root. No duplicar: usar un módulo `sharedStyles` importado con `?inline`.
- **Verificación:** los botones de lección/quiz se ven consistentes con el diseño.

## P1-04 — `onclick="...navigate('#/...')"` redirige siempre a inicio

- **Evidencia:** múltiples componentes usan `window.__APP_ROUTER__.navigate('#/ruta')`, pero `navigate()` espera rutas sin `#` (`src/router.js:71-92`).
- **Impacto:** enlaces internos rotos; el usuario cae en home.
- **Solución:** unificar el contrato: `navigate('/ruta')` sin `#`. Reemplazar todas las llamadas o hacer que `navigate()` normalice `#` al inicio. Lo segundo es más barato y seguro: `path = path.replace(/^#/, '')`.
- **Verificación:** clic en cualquier tarjeta de módulo lleva al módulo correcto.

## P1-05 — `/dashboard` y `/profile` redirigen a `/login`, que no existe

- **Evidencia:** `src/router.js:84` redirige a `/login?redirect=...`; no hay ruta ni componente de login.
- **Impacto:** dashboard y perfil son inalcanzables. El progreso no se puede ver.
- **Solución:** o implementar una pantalla de login mínima, o quitar `auth: true` y permitir acceso local (el curso no tiene backend). Dado que no hay autenticación real, **quitar la puerta** es lo correcto.
- **Verificación:** `/dashboard` carga en sesión limpia.

## P1-06 — No hay ruta 404

- **Evidencia:** `src/router.js:75-76` redirige silenciosamente a `/`.
- **Impacto:** URLs rotas parecen funcionar; errores de enlace se ocultan.
- **Solución:** componente `page-404` con enlace a inicio.
- **Verificación:** `/no-existe` muestra 404.

## P1-07 — `pushState` ignorado / historial inconsistente

- **Evidencia:** `src/router.js:92`.
- **Impacto:** botón atrás del navegador se comporta mal.
- **Solución:** implementar `window.history.pushState` correctamente y escuchar `popstate`.
- **Verificación:** atrás/adelante navegan como se espera.

## P1-08 — `LessonPage` muestra la misma lección para cualquier ID

- **Evidencia:** `src/pages/LessonPage.js` tiene contenido hardcodeado de una sola lección; ignora el `:lessonId`.
- **Impacto:** el curso entero aparece como una sola lección repetida. Es el fallo de contenido más grave después de P0-10.
- **Solución:** cargar la lección desde el JSON de la fase correspondiente por `lessonId`; fallback a 404 si no existe.
- **Verificación:** `/lesson/l0-1-1` y `/lesson/l0-4-5` muestran contenido distinto.

## P1-09 — `LessonPage` guarda siempre `m0-1` / `phase-0`

- **Evidencia:** `src/pages/LessonPage.js` (IDs fijos en el guardado).
- **Impacto:** el progreso se registra en el módulo equivocado.
- **Solución:** derivar módulo y fase de la lección cargada, no de constantes.
- **Verificación:** completar una lección del módulo 0-4 y ver que el dashboard marca m0-4.

## P1-10 — Handler de respuestas múltiples roto

- **Evidencia:** `src/pages/LessonPage.js` (el handler de multi-pregunta no indexa correctamente).
- **Impacto:** las prácticas con varias preguntas puntúan mal.
- **Solución:** iterar preguntas por índice y comparar contra `correct` del mismo índice; escribir prueba de dos preguntas.
- **Verificación:** responder 2 preguntas correctas → 2/2.

## P1-11 — `progress.js`: el módulo se completa con una sola lección

- **Evidencia:** `src/store/progress.js` (`completeModule` se dispara sin verificar que todas las lecciones estén completas).
- **Impacto:** insignias prematuras; progreso falso.
- **Solución:** completar módulo solo cuando `completedLessons.length === module.lessons`.
- **Verificación:** completar 1 de 5 lecciones no desbloquea la insignia de módulo.

## P1-12 — `achievements.js`: condiciones alimentadas con datos incorrectos

- **Evidencia:** `src/store/achievements.js` (`checkAll` recibe `stats` con campos que no coinciden; el diploma sincrónico usa un `stats` desactualizado).
- **Impacto:** logros que nunca se otorgan o se otorgan mal.
- **Solución:** definir un contrato único de `stats` (lecciones completadas, quizzes aprobados, puntaje) y calcularlo desde el store de progreso antes de evaluar.
- **Verificación:** prueba unitaria: 1 lección completa → logro “primera lección”.

## P1-13 — 15 componentes interactivos referenciados, 0 implementados

- **Evidencia:** los JSON de contenido referencian componentes (gráficas, recta numérica, fracciones visuales, etc.) que no existen en `src/components/`.
- **Impacto:** huecos visibles o errores de “componente desconocido”.
- **Solución:** implementar los componentes usados por el contenido real de fase 0 y **eliminar del contenido** las referencias a los que aún no existen. No dejar promesas vacías.
- **Verificación:** recorrer todas las lecciones de fase 0 sin componentes faltantes.

## P1-14 — 16 assets visuales referenciados, 0 existen

- **Evidencia:** contenido referencia imágenes/diagramas inexistentes.
- **Impacto:** imágenes rotas, layout feo.
- **Solución:** generar los assets o quitar las referencias. Para diagramas matemáticos, generarlos con SVG inline (mejor que PNG: escalan y son accesibles).
- **Verificación:** `public/` contiene cada ruta referenciada o el contenido no la referencia.

## P1-15 — PWA falsa: service worker nunca se registra y `index.html` desregistra los existentes

- **Evidencia:** `public/sw.js` existe pero nadie lo registra; `index.html` contiene código que **desregistra** service workers.
- **Impacto:** “instalable/offline” es mentira. Además, borra el SW de cualquier versión previa.
- **Solución:** decidir: o se implementa PWA de verdad (registrar `sw.js`, precachear el shell, estrategia de actualización) o se elimina `sw.js`, el `manifest.json` y las promesas de PWA. Recomendado: implementarla, porque el manifest ya está escrito.
- **Verificación:** DevTools → Application → SW activo; recarga offline muestra el shell.

## P1-16 — `manifest.json`: iconos y screenshots inexistentes, `start_url` absoluto

- **Evidencia:** `public/manifest.json` referencia `icon-*.png` y `screenshot-*.png`; en `public/assets/` solo hay `favicon.svg` e `icon-192.svg`. `start_url: "/"` y rutas absolutas rompen en subpath de GitHub Pages.
- **Impacto:** instalación falla; en `usuario.github.io/repo/` los assets dan 404.
- **Solución:** generar PNGs reales (72–512 + maskable) y screenshots; usar rutas relativas (`./assets/...`) o `import.meta.env.BASE_URL`. `start_url: "./"`.
- **Verificación:** Lighthouse PWA sin errores de manifest.

## P1-17 — `index.html`: OG image y apple-touch-icon rotos; subpath hardcodeado

- **Evidencia:** `index.html` referencia `/assets/og-image.png` (no existe), apple-touch-icon con ruta incorrecta, y el repo hardcodeado en meta.
- **Impacto:** previews sociales rotos; icono iOS roto; despliegue frágil.
- **Solución:** crear `og-image.png` (1200×630), corregir apple-touch-icon, y derivar el base de Vite.
- **Verificación:** validar con un debugger de Open Graph.

## P1-18 — `vite.config.js`: base hardcodeada, chunks pesados eager, sourcemaps en producción

- **Evidencia:** `vite.config.js`.
- **Impacto:** build no portable entre repos; carga inicial lenta (KaTeX, jsPDF, jszip, Dexie en el bundle principal); código fuente expuesto.
- **Solución:** `base: process.env.BASE_URL || '/'`; `import()` dinámico para jsPDF/jszip/QR; `sourcemap: false` en prod.
- **Verificación:** analizar el bundle; `dist/assets` no contiene `.map`.

---

# P2 — Menores / calidad

## P2-01 — Variables CSS inexistentes
`--error-200`, `--error-900`, `--success-200`, `--success-900`, `--warning-900` se usan pero no se definen. Definirlas o sustituirlas.

## P2-02 — Google Fonts `@import` después de reglas en `variables.css`
El `@import` se ignora (warning de build). Moverlo arriba del todo o precargar la fuente en `index.html`.

## P2-03 — Alto contraste no funciona
El setting activa la clase `high-contrast`, pero el CSS usa `[data-theme="high-contrast"]`. Unificar selector.

## P2-04 — `m0-3` y `m0-4` sin audio/imágenes de apoyo
Contenido de fracciones/decimales pierde el enfoque visual prometido. Añadir SVG/figuras.

## P2-05 — Glosario escaso
18 conceptos y 7 fórmulas para un curso que promete “600+ ejercicios” y “fórmulas con hover”. Ampliar o ajustar la promesa.

## P2-06 — `FormulaExplorer` e `InteractiveGraph` registrados pero nunca usados
Nadie escucha `formula-explore`; no hay `<interactive-graph>`. Eliminar el código muerto o conectarlo.

## P2-07 — `npm test` falla (sin archivos de prueba)
`vitest run` sale 1. Añadir al menos pruebas de los stores y validación de contenido, o quitar el script hasta tenerlas.

## P2-08 — `npm run lint`: 107 problemas (81 errores)
Limpiar; activar en CI. Empezar por reglas de `no-unused-vars`/`no-undef`.

## P2-09 — `npm run format` falla
Falta `prettier-plugin-tailwindcss` referenciado en `.prettierrc`. Instalarlo o quitarlo.

## P2-10 — Licencia contradictoria
`package.json` dice MIT; README dice CC-BY-SA-4.0; no hay archivo `LICENSE`. Elegir una y añadir `LICENSE`.

## P2-11 — 8 vulnerabilidades (3 críticas)
`jspdf`, `tinypool`, `vitest` críticas; `vite` y `dompurify` altas. Actualizar; para `jspdf` considerar reemplazo (es pesado y tiene CVEs).

## P2-12 — `document.title` fijo
Consecuencia de P0-12; verificar tras el fix.

## P2-13 — Accesibilidad
Botones sin `aria-label` claro, foco no visible en algunos controles shadow, contraste en modo oscuro dudoso. Pasar axe/Lighthouse y corregir.

## P2-14 — SEO
Sin `robots.txt`, sin `sitemap.xml`, sin datos estructurados `Course`/`LearningResource`, meta description duplicada. Añadir.

---

# Contenido: lo que falta según la materia

El curso promete “de cero a nivel universitario” con 6 fases. **Realidad:** solo fase 0 (números, operaciones, fracciones, decimales) tiene JSON. Faltan por completo:

- Fase 1 — enteros, potencias, álgebra, ecuaciones lineales
- Fase 2 — sistemas, polinomios, cuadráticas, funciones
- Fase 3 — geometría, analítica, transformaciones, trigonometría
- Fase 4 — funciones, límites, derivadas, integrales
- Fase 5 — estadística, probabilidad, distribuciones, inferencia
- Fase 6 — lógica, conjuntos, demostraciones, modelado

Además, la fase 0 declarada tiene 20 lecciones, pero solo 4 módulos con contenido parcial y sin quizzes reales por módulo, sin evaluaciones de fase, sin proyectos integradores implementados.

**Recomendación:** publicar como “Fase 0 — Beta” con expectativas honestas, o generar el contenido antes de prometer el curso completo.

---

# Lo que quedó fuera de esta auditoría (y por qué)

- **Backend / autenticación real:** no existe; no se puede auditar lo que no hay.
- **Rendimiento en dispositivos reales de gama baja:** medí build y carga en Chromium desktop; falta medición móvil real.
- **Contenido matemático profundo de fases 1–6:** no existe el material, no hay nada que auditar; la ausencia es el hallazgo.
- **Verificación legal de “certificado oficial”:** requiere criterio legal; aquí solo señalo el riesgo.

---

# Plan de ejecución sugerido

1. **Desbloquear arranque:** P0-01, P0-02, P0-03, P0-12.
2. **Desbloquear LaTeX:** P0-04, P1-01, P1-02.
3. **Desbloquear datos:** P0-05, P0-06, P0-07, P0-08, P0-09.
4. **Desbloquear navegación:** P1-04, P1-05, P1-06, P1-07.
5. **Desbloquear contenido:** P1-08, P1-09, P1-10, P1-11, P1-12.
6. **Honestidad de producto:** P0-10, P0-11, P1-13, P1-14.
7. **PWA/SEO/assets:** P1-15, P1-16, P1-17, P1-18, P2-14.
8. **Calidad:** P2-01..P2-13.

---

*Fin de la auditoría. Cada hallazgo es verificable de forma independiente: si un fix no cambia el síntoma descrito, el fix está mal.*

---

# Estado tras la implementación (2026-11-04)

## Verificación

- **`npm test`: 8/8 OK** — validación de contenido (JSON, respuestas en rango, ids únicos, assets, manifest).
- **`npm run lint`: 0 problemas** (errores y avisos).
- **`npm run build`: OK** — sin sourcemaps, `jspdf` en chunk diferido, `qrcode`/`function-plot` eliminados.
- **Runtime dev + producción (Chromium real): 21/21 checks OK** (`node scripts/verify.mjs` con dev server activo). Incluye: arranque, KaTeX con `font-family: KaTeX_Main`, `display-mode` correcto, persistencia en localStorage, lección real por ID, diagrama SVG, respuesta correcta/incorrecta, guardado IndexedDB, quiz con pase (100%) y fallo (sin diploma), 404, dashboard, reset que borra IndexedDB, cero errores de consola.
- **Producción:** SW registrado, manifest/iconos/og-image/diagramas todos 200, PDF generado con jspdf 4.
- **Accesibilidad (axe-core, `node scripts/a11y-audit.mjs`): 0 violaciones** de impacto ≥ moderado en 8 páginas (antes: 183 nodos). Corregidos: landmarks duplicados, `role="list"` sin listitems, select sin nombre, contraste del texto muted, logo con nombre accesible no coincidente, foco dentro de `aria-hidden`, opacidad que rompía contraste, jerarquía de headings, toggles de settings ahora operables por teclado (`role="switch"`).

## Aplicados

| Bloque | Hallazgos resueltos |
|---|---|
| Arranque | P0-01, P0-02, P0-03, P0-12 |
| LaTeX | P0-04, P1-01, P1-02 + tooltips reales (glosario ampliado a 26 conceptos) |
| Datos/persistencia | P0-05, P0-06, P0-07, P0-08, P0-09 (autosave 300 ms) |
| Navegación | P1-04, P1-05, P1-06, P1-07 |
| Contenido | P1-08, P1-09, P1-10, P1-11, P1-12, P1-13, P1-14 (21 diagramas generados por `scripts/generate-assets.mjs`) |
| Honestidad de producto | P0-10, P0-11 (constancias, no certificados oficiales), P2-05 parcial |
| PWA/SEO/assets | P1-15, P1-16, P1-17, P1-18, P2-14 (robots, sitemap, JSON-LD, iconos PNG + og-image) |
| Calidad | P2-01, P2-02, P2-03, P2-06, P2-07, P2-08 parcial, P2-09, P2-10, P2-11 parcial (jspdf 4) |
| Botones shadow DOM | P1-03 vía `src/styles/shadow-base.css` |

## Pendiente (documentado, no bloqueante)

- **P0-10 (fondo):** las fases 1–6 siguen sin contenido; el sitio ahora lo declara honestamente ("en desarrollo"). Generar ese contenido es trabajo editorial, no técnico.
- **Vulnerabilidades restantes (6):** cadena `vite/esbuild` (requiere vite 8, breaking) y `vitest/tinypool` (requiere vitest 4, breaking). Son dependencias de desarrollo, no llegan al bundle de producción.
- **Accesibilidad:** verificación axe-core en 8 páginas = 0 violaciones. Pendiente un pase manual con lector de pantalla y en móvil real.

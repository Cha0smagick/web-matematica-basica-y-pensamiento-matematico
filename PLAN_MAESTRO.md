# PLAN MAESTRO: Curso Profesional Completo de Matemática Básica y Pensamiento Matemático
## Para GitHub Pages + GitHub Actions - Estudiantes con Cero Experiencia y Repulsión Matemática

---

## 📋 ÍNDICE GENERAL
1. [Análisis de Pensums Universitarios Mundiales](#1-análisis-de-pensums-universitarios-mundiales)
2. [Arquitectura Técnica y Stack](#2-arquitectura-técnica-y-stack)
3. [Diseño Pedagógico y Psicológico](#3-diseño-pedagógico-y-psicológico)
4. [Estructura del Curso: Fases, Módulos, Lecciones](#4-estructura-del-curso-fases-módulos-lecciones)
5. [Sistema de Diplomas Honorarios](#5-sistema-de-diplomas-honorarios)
6. [Componentes Interactivos Core](#6-componentes-interactivos-core)
7. [Sistema LaTeX + Hover Explicativo](#7-sistema-latex--hover-explicativo)
8. [Gráficas Interactivas y Visualizaciones](#8-gráficas-interactivas-y-visualizaciones)
9. [Marketing, Gamificación y Retención](#9-marketing-gamificación-y-retención)
10. [Plan de Ejecución Atómico Paso a Paso](#10-plan-de-ejecución-atómico-paso-a-paso)

---

## 1. ANÁLISIS DE PENSUMS UNIVERSITARIOS MUNDIALES

### 1.1 Universidades de Referencia Analizadas
| Universidad | País | Programa Relevante | Créditos/Horas |
|-------------|------|-------------------|----------------|
| MIT | USA | 18.01 Single Variable Calculus | 120h |
| Harvard | USA | Math 1a/1b + Math Ma/Mb | 160h |
| Stanford | USA | Math 19/20/21 + Math 51 | 180h |
| Cambridge | UK | Mathematical Tripos Part IA | 200h |
| Oxford | UK | Mathematics Prelims | 180h |
| ETH Zurich | CH | Analysis I/II + Linear Algebra | 220h |
| U. Tokyo | JP | Calculus + Linear Algebra | 160h |
| UNAM | MX | Cálculo Diferencial/Integral + Álgebra | 200h |
| U. Buenos Aires | AR | CBC Matemática + Análisis I | 180h |
| U. Chile | CL | Cálculo I/II + Álgebra Lineal | 180h |
| U. São Paulo | BR | Cálculo 1/2 + Geometria Analítica | 200h |
| Politécnico Madrid | ES | Cálculo I/II + Álgebra | 180h |
| Sorbonne | FR | Analyse + Algèbre (L1/L2) | 200h |
| IIT Bombay | IN | MA101/102 + MA201 | 160h |
| Tsinghua | CN | Mathematical Analysis + Linear Algebra | 180h |

### 1.2 Temas Comunes Identificados (Intersección de todos los pensums)
**NIVEL 0 - PREUNIVERSITARIO (Bridge Course):**
- Sentido numérico y operaciones básicas
- Fracciones, decimales, porcentajes
- Potencias y raíces
- Introducción a variables y expresiones
- Ecuaciones lineales simples
- Geometría básica (área, perímetro, volumen)
- Estadística descriptiva básica

**NIVEL 1 - FUNDAMENTOS UNIVERSITARIOS:**
- Números reales: axiomas, completitud, valor absoluto
- Funciones: definición, dominio, rango, composición, inversa
- Límites: definición ε-δ, teoremas, límites laterales, infinitos
- Continuidad: definición, teoremas (Bolzano, Weierstrass, Darboux)
- Derivadas: definición, reglas, derivadas de orden superior, aplicaciones
- Integrales: Riemann, teorema fundamental, técnicas de integración
- Sucesiones y series: convergencia, criterios, series de potencias, Taylor

**NIVEL 2 - ÁLGEBRA LINEAL:**
- Sistemas lineales, matrices, determinantes
- Espacios vectoriales, subespacios, base, dimensión
- Transformaciones lineales, valores/vectores propios
- Diagonalización, formas cuadráticas
- Espacios con producto interior, ortogonalidad

**NIVEL 3 - PENSAMIENTO MATEMÁTICO AVANZADO:**
- Lógica proposicional y de predicados
- Teoría de conjuntos (ZFC básico)
- Demostraciones: directa, contrapositiva, contradicción, inducción
- Relaciones y funciones (en sentido abstracto)
- Cardinales, ordinales
- Estructuras algebraicas: grupos, anillos, campos

### 1.3 Adaptación para "Cero Experiencia + Repulsión"
| Tema Universitario | Adaptación Didáctica |
|-------------------|---------------------|
| Axiomas de ℝ | "Reglas del juego de los números" con analogías físicas |
| ε-δ | "El juego de la cercanía" con animaciones interactivas |
| Demostraciones | "Detective matemático" - puzzles lógicos progresivos |
| Álgebra lineal | "Transformaciones de espacio" con gráficos 3D manipulables |
| Cálculo | "Medir cambio y acumulación" con simulaciones físicas reales |

---

## 2. ARQUITECTURA TÉCNICA Y STACK

### 2.1 Stack Tecnológico (Zero Dependencies Donde Sea Posible)
```
├── Core: Vanilla HTML5, CSS3 (Custom Properties), ES6+ Modules
├── Math Rendering: KaTeX (lightweight, fast, no MathJax bloat)
├── Interactive Graphs: 
│   ├── Function plotting: function-plot.js (D3-based, 15kb gzipped)
│   ├── Geometry: Geometry.js + Canvas API
│   └── 3D: Three.js (solo donde sea estrictamente necesario)
├── State Management: LocalStorage + IndexedDB (dexie.js, 22kb)
├── Build: Vite (dev) → Static HTML/CSS/JS (prod)
├── Deploy: GitHub Actions → GitHub Pages
├── Testing: Playwright (E2E) + Vitest (unit)
├── Linting: ESLint + Stylelint + Prettier
└── Analytics: Plausible (privacy-first) o umami self-hosted
```

### 2.2 Estructura de Archivos
```
/ (root)
├── index.html                 # Entry point - Landing / Dashboard
├── package.json
├── vite.config.js
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions deploy
├── src/
│   ├── main.js               # Bootstrap app
│   ├── router.js             # SPA router (hash-based para GH Pages)
│   ├── store/
│   │   ├── index.js          # State management (progress, user, settings)
│   │   ├── progress.js       # Progreso persistente
│   │   └── achievements.js   # Diplomas y logros
│   ├── components/
│   │   ├── ui/               # Componentes UI reutilizables
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── Tooltip.js    # Sistema hover explicativo
│   │   │   ├── ProgressRing.js
│   │   │   ├── Accordion.js
│   │   │   ├── Tabs.js
│   │   │   └── Notification.js
│   │   ├── math/             # Componentes matemáticos
│   │   │   ├── LatexRenderer.js      # KaTeX wrapper + hover
│   │   │   ├── FormulaExplorer.js    # Clickable formulas
│   │   │   ├── InteractiveGraph.js   # Wrapper function-plot
│   │   │   ├── GeometryCanvas.js     # Canvas geometría
│   │   │   ├── NumberLine.js         # Recta numérica interactiva
│   │   │   ├── FractionVisualizer.js # Fracciones visuales
│   │   │   ├── EquationSolver.js     # Paso a paso ecuaciones
│   │   │   └── ProofBuilder.js       # Constructor de demostraciones
│   │   ├── course/           # Componentes de curso
│   │   │   ├── PhaseCard.js
│   │   │   ├── ModuleCard.js
│   │   │   ├── LessonViewer.js
│   │   │   ├── QuizEngine.js         # Motor de preguntas
│   │   │   ├── QuestionRenderer.js   # Render múltiples tipos
│   │   │   └── DiplomaGenerator.js   # Generador PDF/imagen
│   │   └── layout/
│   │       ├── Header.js
│   │       ├── Sidebar.js
│   │       ├── Footer.js
│   │       └── Layout.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── DashboardPage.js
│   │   ├── PhasePage.js
│   │   ├── ModulePage.js
│   │   ├── LessonPage.js
│   │   ├── QuizPage.js
│   │   ├── PracticePage.js
│   │   ├── DiplomaPage.js
│   │   ├── ProfilePage.js
│   │   └── SettingsPage.js
│   ├── courses/
│   │   ├── index.js          # Registro de cursos
│   │   └── math-fundamentals/  # Curso principal
│   │       ├── manifest.json  # Metadatos del curso
│   │       ├── phases/        # 6 fases
│   │       │   ├── phase-0.json  # Fundamentos (puente)
│   │       │   ├── phase-1.json  # Números y Operaciones
│   │       │   ├── phase-2.json  # Álgebra Inicial
│   │       │   ├── phase-3.json  # Geometría y Medida
│   │       │   ├── phase-4.json  # Funciones y Gráficas
│   │       │   ├── phase-5.json  # Estadística y Probabilidad
│   │       │   └── phase-6.json  # Pensamiento Matemático Avanzado
│   │       └── assets/        # Imágenes, datos, etc.
│   ├── utils/
│   │   ├── latex.js          # Utilidades LaTeX + diccionario hover
│   │   ├── math.js           # Helpers matemáticos
│   │   ├── storage.js        # LocalStorage/IndexedDB wrapper
│   │   ├── animation.js      # Helpers animación (GSAP-lite o custom)
│   │   ├── accessibility.js  # a11y helpers
│   │   └── export.js         # PDF/imagen export
│   ├── styles/
│   │   ├── variables.css     # Design tokens
│   │   ├── reset.css
│   │   ├── globals.css
│   │   ├── components/       # CSS por componente
│   │   ├── pages/            # CSS por página
│   │   ├── themes/           # Temas (light/dark/high-contrast)
│   │   └── print.css         # Para diplomas
│   └── data/
│       ├── glossary.json     # Diccionario términos + explicaciones
│       ├── formulas.json     # Base de fórmulas con metadatos
│       ├── analogies.json    # Analogías pedagógicas
│       └── misconceptions.json # Errores comunes + correcciones
├── public/
│   ├── favicon.ico
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   └── assets/               # Imágenes estáticas, fonts
└── dist/                     # Build output (gitignored)
```

### 2.3 GitHub Actions Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. DISEÑO PEDAGÓGICO Y PSICOLÓGICO

### 3.1 Principios Rectores (Basados en Ciencia del Aprendizaje)
| Principio | Implementación |
|-----------|----------------|
| **Carga Cognitiva Gestionada** | Chunking: micro-lecciones 5-7 min, un concepto a la vez |
| **Andamiaje (Scaffolding)** | Niveles: Guiado → Semi-guiado → Independiente → Experto |
| **Práctica Espaciada (Spaced Repetition)** | Algoritmo SM-2 adaptado para revisión de conceptos |
| **Interleaving** | Mezcla de tipos de problemas en práctica |
| **Recuperación Activa** | Preguntas antes de explicar (pre-test), quizzes frecuentes |
| **Feedback Inmediato y Específico** | Explicación por opción (correcta/incorrecta) |
| **Metacognición** | Prompts de reflexión: "¿Qué estrategia usaste?" |
| **Mentalidad de Crecimiento (Growth Mindset)** | Lenguaje: "Aún no" vs "No puedo", celebrar esfuerzo |
| **Reducción de Ansiedad** | Sin temporizadores, reintentos ilimitados, "modo seguro" |
| **Relevancia Personal** | Contextos: vida diaria, trabajo, hobbies, curiosidad |

### 3.2 Perfil del Usuario Objetivo
- **Edad:** 16+ (adolescentes tardíos a adultos)
- **Background:** Cero formación matemática formal o trauma previo
- **Emociones:** Ansiedad, evitación, "no soy de letras/ciencias", síndrome del impostor
- **Metas:** Entender, no memorizar; aplicar a vida real; recuperar confianza
- **Disponibilidad:** 15-30 min/día, móvil y desktop

### 3.3 Modelo de Lección Tipo (Micro-learning)
```
LECCIÓN (5-7 min)
├── 1. GANCHO (30 seg) - Pregunta intrigante / situación real / "¿Sabías que...?"
├── 2. CONEXIÓN (1 min) - Vincula con conocimiento previo (aunque sea intuitivo)
├── 3. CONCEPTO CORE (2-3 min) - Una idea central, visual + interactiva + LaTeX hover
├── 4. PRÁCTICA GUIADA (1-2 min) - 2-3 preguntas con scaffolding descendente
├── 5. REFLEXIÓN (30 seg) - "Explica con tus palabras" / "¿Dónde lo ves en tu vida?"
└── 6. PUENTE (15 seg) - "En la próxima lección veremos cómo esto conecta con..."
```

### 3.4 Tipos de Preguntas (Motor de Quiz)
| Tipo | Descripción | Uso Pedagógico |
|------|-------------|----------------|
| **Conceptual Click** | Click en zona correcta de gráfica/diagrama | Comprensión visual/espacial |
| **Opción Múltiple Clásica** | 1 correcta, 3 distractores diseñados (errores comunes) | Diagnóstico preciso |
| **Opción Múltiple Múltiple** | "Selecciona todas las que apliquen" | Pensamiento relacional |
| **Ordenamiento** | Arrastra pasos de demostración/procedimiento | Secuenciación lógica |
| **Completar (Cloze)** | Arrastra términos a huecos en definición/fórmula | Precisión terminológica |
| **Emparejamiento** | Conecta concepto ↔ representación ↔ ejemplo | Múltiples representaciones |
| **Entrada Numérica** | Input numérico con tolerancia | Cálculo sin adivinanza |
| **Expresión LaTeX** | Input matemático validado (mathlive) | Notación formal |
| **Verdadero/Falso + Justificación** | V/F + "Porque..." | Razonamiento explícito |
| **Confianza** | "¿Qué tan seguro estás? (1-5)" + luego revela | Metacognición |

---

## 4. ESTRUCTURA DEL CURSO: FASES, MÓDULOS, LECCIONES

### 4.1 Visión General: 6 Fases → 24 Módulos → ~180 Lecciones → ~600 Preguntas

```
FASE 0: PUENTE - "Los Números Son Tus Amigos" (4 módulos, 20 lecciones)
├── M0.1: Conteo y Cantidad (Intuición numérica)
├── M0.2: Operaciones Básicas (Significado, no algoritmo)
├── M0.3: Fracciones y Partes (Visual, concreto)
├── M0.4: Decimales y Porcentajes (Dinero, medidas)

FASE 1: FUNDAMENTOS - "El Lenguaje de los Patrones" (4 módulos, 30 lecciones)
├── M1.1: Números Enteros y Recta Numérica
├── M1.2: Potencias y Raíces (Crecimiento/Decrecimiento)
├── M1.3: Expresiones Algebraicas (Variables = cajas misteriosas)
├── M1.4: Ecuaciones Lineales (Equilibrio, balanza)

FASE 2: ÁLGEBRA - "Resolver Misterios" (4 módulos, 30 lecciones)
├── M2.1: Sistemas de Ecuaciones (Intersección de rectas)
├── M2.2: Polinomios y Factorización (Área de rectángulos)
├── M2.3: Ecuaciones Cuadráticas (Parábolas en la vida real)
├── M2.4: Funciones (Máquinas de transformar)

FASE 3: GEOMETRÍA - "Formas y Espacio" (4 módulos, 30 lecciones)
├── M3.1: Geometría Plana (Ángulos, triángulos, círculos)
├── M3.2: Geometría Analítica (Coordenadas = GPS matemático)
├── M3.3: Transformaciones (Simetría, rotación, arte)
├── M3.4: Medida y Trigonometría Básica (Sombras, rampas, navegación)

FASE 4: FUNCIONES Y CÁLCULO INTUITIVO - "El Cambio y la Acumulación" (4 módulos, 35 lecciones)
├── M4.1: Tipos de Funciones (Lineal, cuadrática, exponencial, logarítmica)
├── M4.2: Límites Intuitivos (Acercarse sin tocar)
├── M4.3: Derivada = Velocidad Instantánea (Tangentes, optimización)
├── M4.4: Integral = Área Acumulada (Riemann visual, física)

FASE 5: DATOS Y AZAR - "Decidir con Incertidumbre" (4 módulos, 25 lecciones)
├── M5.1: Estadística Descriptiva (Resumir datos, detectar mentiras)
├── M5.2: Probabilidad (Juegos, riesgos, decisiones)
├── M5.3: Distribuciones (Normal, binomial - la campana de Gauss)
├── M5.4: Inferencia Básica (Encuestas, tests A/B, correlación ≠ causalidad)

FASE 6: PENSAMIENTO MATEMÁTICO - "Pensar como Matemático" (4 módulos, 20 lecciones)
├── M6.1: Lógica y Argumentación (Falacias, pensamiento crítico)
├── M6.2: Conjuntos y Relaciones (Clasificar, agrupar, Venn)
├── M6.3: Demostraciones (Detective: prueba, contraejemplo, inducción)
├── M6.4: Matemáticas en el Mundo (Modelado, criptografía, IA, arte)
```

### 4.2 Detalle de Fase 0 (Ejemplo - Nivel Atómico)
**M0.1: Conteo y Cantidad (5 lecciones)**
| Lección | Objetivo | Actividad Core | Preguntas |
|---------|----------|----------------|-----------|
| L0.1.1 | Subitizing (reconocer cantidad sin contar) | Juego de dados/dominó interactivo | 5 conceptual click |
| L0.1.2 | Correspondencia 1-a-1 | Arrastrar objetos a contenedores | 5 completar |
| L0.1.3 | Cardinalidad: el último número = cantidad | Animación contando objetos | 3 múltiple choice |
| L0.1.4 | Comparar cantidades (más/menos/igual) | Balanza visual interactiva | 5 emparejamiento |
| L0.1.5 | Números ordinales (1º, 2º, 3º) | Carrera de personajes | 3 ordenamiento |

---

## 5. SISTEMA DE DIPLOMAS HONORARIOS

### 5.1 Jerarquía de Logros
```
🏆 DIPLOMA DE HONOR - CURSO COMPLETO (Oro)
    ├── 🥇 Certificado de Fase (6 total - uno por fase)
    │       ├── 🥈 Insignia de Módulo (24 total)
    │       │       ├── 🥉 Medal de Lección (180 total)
    │       │       └── ⭐ Estrella de Práctica Perfecta (opcional)
    │       └── 🎖️ Maestro de Práctica (completar todas las prácticas de fase)
    └── 💎 Logros Especiales (secretos/desbloqueables)
            ├── "Primer Paso" - Primera lección completada
            ├── "Racha de Fuego" - 7 días consecutivos
            ├── "Detective" - Encontrar todos los errores en "Encuentra el fallo"
            ├── "Velocista" - Completar módulo en < tiempo objetivo
            ├── "Perfeccionista" - 100% en quiz de módulo
            └── "Mentor" - Ayudar a otros (futuro: foro/comunidad)
```

### 5.2 Diploma Generator (Technical Specs)
- **Formato:** SVG → PNG/PDF (canvas + jsPDF)
- **Contenido:** Nombre, fecha, hash único verificable, QR a verificación web
- **Diseño:** Plantilla por nivel (módulo/fase/curso) con colores distintivos
- **Firma:** Hash SHA-256 del progreso + timestamp + clave secreta del repo
- **Verificación:** Página `/verify/{hash}` en el sitio

### 5.3 Criterios de Otorgamiento
| Nivel | Requisito |
|-------|-----------|
| Lección | Completar lección + ≥70% en práctica guiada |
| Módulo | Completar todas las lecciones + ≥75% en quiz final módulo |
| Fase | Completar todos los módulos + ≥80% en evaluación de fase + proyecto integrador |
| Curso | Completar 6 fases + ≥85% en evaluación final integradora + proyecto final |

---

## 6. COMPONENTES INTERACTIVOS CORE

### 6.1 LatexRenderer (Componente Central)
```javascript
// Características:
// - Render KaTeX con displayMode auto
// - Hover tooltip con explicación término a término
// - Click para "FormulaExplorer" (modal detallado)
// - Copiar LaTeX/mathml al portapapeles
// - Accesibilidad: aria-label con lectura natural
// - Temas: light/dark/high-contrast
// - Animación de aparición (stagger)
```

### 6.2 FormulaExplorer (Modal Detallado)
```
Al hacer click en cualquier fórmula:
├── Vista grande centrada
├── Panel lateral: "¿Qué significa cada símbolo?"
│   ├── Tabla: Símbolo | Nombre | Significado | Ejemplo
├── Pestaña: "Origen/Historia" (contexto histórico)
├── Pestaña: "Variaciones" (formas equivalentes)
├── Pestaña: "Aplicaciones" (dónde se usa en vida real)
├── Botón: "Ver derivación paso a paso"
├── Botón: "Probar con números" → Calculadora interactiva
└── Botón: "Copiar LaTeX" / "Descargar como imagen"
```

### 6.3 InteractiveGraph (Wrapper function-plot + extras)
```javascript
// Features:
// - Zoom/pan con mouse/touch
// - Traza punto: muestra coordenadas + valor función
// - Sliders para parámetros (a, b, c en ax²+bx+c)
// - Múltiples funciones superpuestas
// - Área bajo curva (sombra + valor integral)
// - Rectas tangentes/secantes animadas
// - Puntos críticos marcados (raíces, vértices, intersecciones)
// - Exportar como imagen/SVG
// - Modo "exploración libre" vs "guiada"
```

### 6.4 Tooltip System (Hover Explicativo Universal)
```javascript
// Aplicable a CUALQUIER elemento con data-tooltip="key"
// Diccionario centralizado en /src/data/glossary.json
// Estructura entrada:
{
  "derivative": {
    "term": "Derivada",
    "short": "Velocidad instantánea de cambio",
    "long": "La derivada de una función en un punto mide qué tan rápido cambia la función en ese preciso instante. Es la pendiente de la recta tangente.",
    "analogy": "Como el velocímetro de un auto: te dice la velocidad AHORA, no el promedio del viaje.",
    "visual": "tangent-animation.svg",
    "related": ["limit", "tangent", "rate-of-change"],
    "level": "phase-4"
  }
}
```

---

## 7. SISTEMA LATEX + HOVER EXPLICATIVO

### 7.1 Diccionario LaTeX Mapeado a Explicaciones
- Cada símbolo/comando LaTeX tiene entrada en glossary.json
- Parser detecta tokens en fórmula renderizada
- Inyecta `<span data-tooltip="token">` alrededor de cada token
- Tooltip muestra: nombre, definición corta, analogía, visual

### 7.2 Ejemplo Práctico
```latex
% Fórmula: f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
% Tokens detectados: f', x, lim, h, to, 0, frac, f, x+h, f, x, h
% Hover en "lim" → "Límite: valor al que se acerca una expresión"
% Hover en "f'(x)" → "Derivada: notación de Leibniz/Newton para tasa de cambio"
% Hover en "frac" → "Fracción: división, aquí diferencia de valores / diferencia de entrada"
```

### 7.3 Niveles de Explicación (Adaptativo)
| Nivel Usuario | Contenido Tooltip |
|---------------|-------------------|
| Principiante (Fase 0-1) | Analogía concreta + definición simple |
| Intermedio (Fase 2-3) | Definición formal + conexión con previo |
| Avanzado (Fase 4-6) | Definición rigorosa + generalización + excepción |

---

## 8. GRÁFICAS INTERACTIVAS Y VISUALIZACIONES

### 8.1 Catálogo de Visualizaciones por Fase
| Fase | Visualizaciones Clave |
|------|----------------------|
| 0 | Recta numérica interactiva, bloques base-10, área fracciones, regla de 3 visual |
| 1 | Potencias como crecimiento (animación), recta numérica extendida, balanza ecuaciones |
| 2 | Gráficas de funciones (deslizadores parámetros), factorización como área, parábola interactiva |
| 3 | Geoboard virtual, transformaciones arrastrables, círculo unitario trigonométrico, teorema Pitágoras animado |
| 4 | Secantes → tangente animada, rectángulos Riemann ajustables, optimización visual (máx/mín), campo de pendientes |
| 5 | Histogramas interactivos, árbol de probabilidad, curva normal manipulable (media/desv), simulador Monte Carlo |
| 6 | Diagramas de Venn interactivos, árboles de demostración, máquina de Turing visual, redes neuronales simples |

### 8.2 Especificación Técnica Gráficos
- **Library base:** function-plot.js (D3 wrapper) para 2D
- **Canvas API** para geometría, animaciones custom, performance
- **Three.js (lazy load)** solo Fase 3 (3D) y Fase 6 (redes)
- **Responsive:** SVG para gráficos estáticos, Canvas para animaciones
- **Accesibilidad:** Tabla de datos alternativa, descripciones de texto, navegación teclado

---

## 9. MARKETING, GAMIFICACIÓN Y RETENCIÓN

### 9.1 Onboarding Psicológico (Primeros 3 minutos)
```
1. PANTALLA BIENVENIDA: "¿Te da miedo las mates? No estás solo. 73% de adultos sienten ansiedad matemática. Aquí no hay exámenes, solo descubrimiento."
2. TEST DIAGNÓSTICO RÁPIDO (5 preguntas, sin presión): "Esto nos ayuda a empezar en tu nivel exacto"
3. PERFIL DE APRENDIZAJE: Visual/Verbal/Kinestésico → adapta tipo de ejercicios
4. COMPROMISO MICRO: "¿Puedes dedicar 10 min/día?" → Slider → "Perfecto, eso son 60 horas al año = nivel universitario"
5. PRIMERA LECCIÓN INMEDIATA: L0.1.1 (Subitizing) - Éxito garantizado en 60 seg
```

### 9.2 Sistema de Progresión Visual
- **Mapa del Tesoro:** Mapa visual tipo juego (tipo Duolingo) con islas = fases
- **Árbol de Habilidades:** Nodos desbloqueables, prerrequisitos visuales
- **Dashboard Personal:** Gráfica de actividad (heatmap tipo GitHub), racha, tiempo total, conceptos dominados
- **Nivel de "Confianza Matemática":** Barra que sube con cada éxito (no solo aciertos, sino intento)

### 9.3 Hooks de Retención
| Hook | Implementación |
|------|----------------|
| **Racha Diaria** | Contador visible, "Protege tu racha" (1 día gracia/semana) |
| **Revisión Inteligente** | Notificación: "Hace 3 días aprendiste X, ¿repaso rápido de 2 min?" |
| **Progreso Social (Opcional)** | Compartir diploma: "Acabo de entender derivadas! 🎓" |
| **Contenido Fresco** | "Desafío del día" - 1 problema curioso no curricular |
| **Narrativa** | Personaje guía "Ada" (Lovelace) evoluciona contigo |

### 9.4 Landing Page Marketing (SEO + Conversión)
- **Hero:** "De 'odio las mates' a 'entiendo el mundo' en 20 min/día"
- **Social Proof:** Testimonios reales (anónimos) + stats: "12,400 personas completaron Fase 1"
- **Demo Interactiva:** Primer ejercicio jugable SIN registro
- **Curriculum Visible:** Acordeón con todas las fases/módulos
- **FAQ Objeciones:** "¿Y si soy muy mayor?", "¿Necesito comprar algo?", "¿Sirve para mi trabajo?"
- **CTA Primario:** "Empezar gratis ahora →" (va directo a L0.1.1)

---

## 10. PLAN DE EJECUCIÓN ATÓMICO PASO A PASO

### FASE A: FUNDACIÓN Y SETUP (Semana 1)
#### A1. Inicialización del Proyecto
- [ ] A1.1 Crear `package.json` con dependencias exactas
- [ ] A1.2 Configurar `vite.config.js` (build multi-page, base path para GH Pages)
- [ ] A1.3 Configurar `.github/workflows/deploy.yml`
- [ ] A1.4 Crear estructura de carpetas completa (`mkdir -p`)
- [ ] A1.5 Configurar `eslint.config.js`, `.prettierrc`, `stylelint.config.js`
- [ ] A1.6 Configurar `tsconfig.json` (check JS con JSDoc) o puro JS con JSDoc
- [ ] A1.7 Crear `index.html` base con SPA router hash-based
- [ ] A1.8 Configurar Service Worker (`public/sw.js`) para offline-first
- [ ] A1.9 PWA Manifest (`public/manifest.json`)
- [ ] A1.10 Verificar build y deploy manual a GH Pages

#### A2. Design System y Tokens
- [ ] A2.1 Definir `src/styles/variables.css` (colores, espaciado, tipografía, sombras, radios, transiciones, z-index, breakpoints)
- [ ] A2.2 Crear `src/styles/reset.css` (modern normalize)
- [ ] A2.3 Crear `src/styles/globals.css` (utilidades, tipografía base, focus-visible, selection)
- [ ] A2.4 Definir temas: `light.css`, `dark.css`, `high-contrast.css` (CSS custom properties)
- [ ] A2.5 Crear `src/styles/print.css` (para diplomas)
- [ ] A2.6 Componentes base UI: Button, Card, Modal, Tooltip, ProgressRing, Accordion, Tabs, Notification
- [ ] A2.7 Layout components: Header, Sidebar, Footer, Layout
- [ ] A2.8 Storybook o página de pruebas visuales (`/test-components.html`)

#### A3. State Management y Persistencia
- [ ] A3.1 Crear `src/store/index.js` (event bus simple + estado reactiva con Proxy)
- [ ] A3.2 Implementar `src/store/progress.js` (localStorage + IndexedDB via Dexie)
- [ ] A3.3 Implementar `src/store/achievements.js` (logros, diplomas, rachas)
- [ ] A3.4 Implementar `src/store/settings.js` (tema, idioma, accesibilidad, notificaciones)
- [ ] A3.5 Sincronización multi-tab (BroadcastChannel)
- [ ] A3.6 Migración de esquema (versionado en localStorage)

#### A4. Router y Navegación
- [ ] A4.1 Hash-based router (`src/router.js`) con guards
- [ ] A4.2 Rutas definidas: `/`, `/dashboard`, `/phase/:id`, `/module/:id`, `/lesson/:id`, `/quiz/:id`, `/practice/:id`, `/diploma/:type/:id`, `/profile`, `/settings`, `/verify/:hash`
- [ ] A4.3 Navegación con teclado (arrows, ESC, Enter)
- [ ] A4.4 Breadcrumbs dinámicos
- [ ] A4.5 Deep linking a lección/pregunta específica

### FASE B: MOTOR DE CONTENIDO Y CURSO BASE (Semana 2)
#### B1. Estructura de Datos del Curso
- [ ] B1.1 Diseñar esquema JSON para: Course, Phase, Module, Lesson, Question
- [ ] B1.2 Crear `src/courses/math-fundamentals/manifest.json`
- [ ] B1.3 Crear 6 archivos de fase (`phase-0.json` a `phase-6.json`) con estructura completa
- [ ] B1.4 Crear `src/data/glossary.json` (mínimo 200 términos)
- [ ] B1.5 Crear `src/data/formulas.json` (mínimo 100 fórmulas con metadatos)
- [ ] B1.6 Crear `src/data/analogies.json` (analogías por concepto)
- [ ] B1.7 Crear `src/data/misconceptions.json` (errores comunes por tema)

#### B2. Componentes Matemáticos Core
- [ ] B2.1 `LatexRenderer.js` - KaTeX wrapper con hover tokens
- [ ] B2.2 `FormulaExplorer.js` - Modal detallado fórmula
- [ ] B2.3 `InteractiveGraph.js` - Wrapper function-plot + controles
- [ ] B2.4 `GeometryCanvas.js` - Geometría interactiva Canvas
- [ ] B2.5 `NumberLine.js` - Recta numérica arrastrable
- [ ] B2.6 `FractionVisualizer.js` - Fracciones visuales (área, recta, conjunto)
- [ ] B2.7 `EquationSolver.js` - Paso a paso ecuaciones (animado)
- [ ] B2.8 `ProofBuilder.js` - Constructor demostraciones (arrastra pasos)

#### B3. Motor de Lecciones y Quiz
- [ ] B3.1 `LessonViewer.js` - Render lección con progreso, navegación, modo foco
- [ ] B3.2 `QuizEngine.js` - Motor estado: pregunta actual, respuestas, tiempo, puntuación
- [ ] B3.3 `QuestionRenderer.js` - Render 10 tipos de pregunta (ver sección 3.4)
- [ ] B3.4 Feedback system: explicación por opción, "¿Por qué esta es incorrecta?"
- [ ] B3.5 Algoritmo spaced repetition (SM-2 simplificado) para revisión
- [ ] B3.6 Modo "Práctica" vs "Evaluación" (diferentes reglas)

#### B4. Páginas Principales
- [ ] B4.1 `HomePage.js` - Landing marketing + demo interactiva
- [ ] B4.2 `DashboardPage.js` - Mapa progreso, racha, próximos pasos, logros
- [ ] B4.3 `PhasePage.js` - Vista fase con módulos, requisitos, proyecto integrador
- [ ] B4.4 `ModulePage.js` - Lista lecciones, quiz final, práctica mixta
- [ ] B4.5 `LessonPage.js` - Contenedor lección + sidebar navegación
- [ ] B4.6 `QuizPage.js` - Pantalla quiz con timer opcional, navegación preguntas
- [ ] B4.7 `PracticePage.js` - Práctica espaciada personalizada
- [ ] B4.8 `DiplomaPage.js` - Vista diploma, descargar, compartir, verificar
- [ ] B4.9 `ProfilePage.js` - Estadísticas detalladas, exportar datos
- [ ] B4.10 `SettingsPage.js` - Temas, accesibilidad, notificaciones, datos

### FASE C: CONTENIDO COMPLETO FASE 0 (Semana 3)
#### C1. Contenido Detallado Fase 0
- [ ] C1.1 Escribir 20 lecciones completas (HTML/Markdown → JSON)
- [ ] C1.2 Crear 100+ preguntas variadas (5 por lección + quiz módulo)
- [ ] C1.3 Diseñar 4 evaluaciones de módulo (15-20 preguntas cada una)
- [ ] C1.4 Crear proyecto integrador Fase 0: "Mi Presupuesto Mensual"
- [ ] C1.5 Grabar/crear animaciones GIF/WebP para conceptos clave
- [ ] C1.6 Poblar glossary.json con términos Fase 0
- [ ] C1.7 Poblar formulas.json con fórmulas Fase 0
- [ ] C1.8 Testing exhaustivo Fase 0 (manual + automatizado)

#### C2. Diplomas Fase 0
- [ ] C2.1 Diseñar plantilla SVG: Medalla Lección, Insignia Módulo, Certificado Fase
- [ ] C2.2 Implementar `DiplomaGenerator.js` (SVG → Canvas → PDF/imagen)
- [ ] C2.3 Sistema de hash verificación + página `/verify/`
- [ ] C2.4 Compartir: descargar PNG, generar link, botón redes sociales

### FASE D: CONTENIDO FASES 1-3 (Semanas 4-6)
#### D1. Fase 1: Fundamentos (Semana 4)
- [ ] D1.1 30 lecciones + 150 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] D1.2 Proyecto integrador: "Diseña tu Huerta (área/perímetro/costos)"
- [ ] D1.3 Gráficas interactivas: recta numérica extendida, potencias visuales, balanza ecuaciones
- [ ] D1.4 Diplomas Fase 1

#### D2. Fase 2: Álgebra (Semana 5)
- [ ] D2.1 30 lecciones + 150 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] D2.2 Proyecto integrador: "El Misterio de la Parábola (diseño puente/fuente)"
- [ ] D2.3 Gráficas: parábola interactiva (vértice, foco, directriz), sistemas como intersección
- [ ] D2.4 Diplomas Fase 2

#### D3. Fase 3: Geometría (Semana 6)
- [ ] D3.1 30 lecciones + 150 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] D3.2 Proyecto integrador: "Arquitecto por un Día (diseña una casa)"
- [ ] D3.3 Gráficas: Geoboard virtual, transformaciones arrastrables, círculo unitario
- [ ] D3.4 Diplomas Fase 3
- [ ] D3.5 Three.js lazy-loaded para vista 3D opcional (sólidos platónicos)

### FASE E: CONTENIDO FASES 4-6 + AVANZADO (Semanas 7-9)
#### E1. Fase 4: Funciones y Cálculo Intuitivo (Semana 7)
- [ ] E1.1 35 lecciones + 175 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] E1.2 Proyecto integrador: "Optimiza tu Negocio (costos/ingresos/ganancia máxima)"
- [ ] E1.3 Gráficas: secante→tangente animada, Riemann ajustable, campo pendientes
- [ ] E1.4 Diplomas Fase 4

#### E2. Fase 5: Datos y Azar (Semana 8)
- [ ] E2.1 25 lecciones + 125 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] E2.2 Proyecto integrador: "Detective de Datos (analiza dataset real anonimizado)"
- [ ] E2.3 Gráficas: histogramas interactivos, árbol probabilidad, curva normal manipulable, Monte Carlo
- [ ] E2.4 Diplomas Fase 5

#### E3. Fase 6: Pensamiento Matemático (Semana 9)
- [ ] E3.1 20 lecciones + 100 preguntas + 4 quiz módulo + 1 evaluación fase
- [ ] E3.2 Proyecto integrador FINAL: "Modela un Problema Real de Tu Vida"
- [ ] E3.3 Gráficas: Venn interactivos, árboles demostración, red neuronal simple visual
- [ ] E3.4 Diplomas Fase 6 + DIPLOMA DE HONOR CURSO COMPLETO
- [ ] E3.5 Evaluación final integradora (50 preguntas, todas las fases)

### FASE F: PULIMIENTO, ACCESIBILIDAD, TESTING, DEPLOY (Semana 10)
#### F1. Accesibilidad (WCAG 2.1 AA)
- [ ] F1.1 Auditoría completa: contraste, focus order, ARIA labels, landmarks
- [ ] F1.2 Navegación solo teclado en TODO
- [ ] F1.3 Screen reader testing (NVDA, VoiceOver)
- [ ] F1.4 Modo alto contraste funcional
- [ ] F1.5 Reducir movimiento (prefers-reduced-motion)
- [ ] F1.6 Textos alternativos en todas las gráficas/imágenes
- [ ] F1.7 Idioma: español (principal), estructura i18n lista para más

#### F2. Performance y Optimización
- [ ] F2.1 Code splitting por fase (lazy load phases 1-6)
- [ ] F2.2 Three.js lazy load solo cuando se usa
- [ ] F2.3 KaTeX lazy load (solo páginas con fórmulas)
- [ ] F2.4 Imágenes: WebP, responsive, lazy loading nativo
- [ ] F2.5 Service Worker: cache first para assets, network first para datos
- [ ] F2.6 Bundle analysis: target < 200kb JS gzipped initial
- [ ] F2.7 Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

#### F3. Testing Automatizado
- [ ] F3.1 Playwright E2E: flujo completo usuario nuevo → diploma fase 0
- [ ] F3.2 Playwright: navegar todas las páginas, no 404s, no errores consola
- [ ] F3.3 Vitest: store, utils, algoritmos (spaced repetition, scoring)
- [ ] F3.4 Visual regression: Chromatic o pixelmatch para componentes UI
- [ ] F3.5 Accessibility testing automatizado (axe-core en CI)

#### F4. Analytics y Monitoreo (Privacy-First)
- [ ] F4.1 Integrar Plausible/Umami (eventos personalizados: lesson_complete, quiz_pass, diploma_earn)
- [ ] F4.2 Dashboard interno (solo admin) con métricas agregadas
- [ ] F4.3 Error tracking: Sentry (gratis para open source) o custom endpoint

#### F5. Documentación y Lanzamiento
- [ ] F5.1 README.md completo: instalación, desarrollo, deploy, arquitectura
- [ ] F5.2 CONTRIBUTING.md (aunque sea solo tú)
- [ ] F5.3 CHANGELOG.md
- [ ] F5.4 Guía de usuario embebida en la web (Help modal)
- [ ] F5.5 Verificar deploy producción en `https://usuario.github.io/repo/`
- [ ] F5.6 Configurar dominio personalizado (opcional)
- [ ] F5.7 Anunciar: redes, comunidades matemáticas, educativas

---

## 📊 MÉTRICAS DE ÉXITO (KPIs)

| Métrica | Objetivo Mínimo | Objetivo Ideal |
|---------|-----------------|----------------|
| Tasa completitud Fase 0 | 40% | 60% |
| Tasa completitud Curso Completo | 8% | 15% |
| Tiempo medio lección | 5-7 min | 4-6 min |
| Puntuación media quiz módulo | 75% | 85% |
| Retención día 7 | 25% | 40% |
| Retención día 30 | 12% | 25% |
| NPS (Net Promoter Score) | 30 | 50 |
| Diplomas generados/mes | 100 | 1000 |

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Scope creep (añadir features infinitas) | Alta | Crítico | **Congelar scope en este plan**. Solo añadir tras v1.0 lanzado |
| Contenido demasiado denso | Media | Alto | Testing con usuarios reales (5-10) cada fase antes de continuar |
| Performance en móviles bajos | Media | Alto | Testing en dispositivo real viejo; budgets estrictos |
| KaTeX/Function-plot bugs en Safari | Baja | Medio | Polyfills, fallbacks, testing cross-browser |
| GitHub Pages limits (1GB, 10 builds/hr) | Baja | Bajo | Optimizar assets; builds incrementales |
| Burnout desarrollador (proyecto masivo) | Alta | Crítico | **Timeboxing estricto**: 2h/día máx. Semana de descanso cada 3. MVP primero. |

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Ejecutar A1.1 - A1.10: Inicialización completa del proyecto con build + deploy funcionando.**

Luego continuar secuencialmente: A2 → A3 → A4 → B1 → B2 → B3 → B4 → C1 → C2 → D1 → D2 → D3 → E1 → E2 → E3 → F1-F5.

---

*Plan creado por Adeptus Vinictus II - Tecnoprieste de la Technostrata*
*Fecha: 2026-10-29 | Versión: 1.0 | Estado: LISTO PARA EJECUCIÓN*
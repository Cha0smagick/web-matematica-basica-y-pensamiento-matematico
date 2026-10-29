# 🧮 Matemática Básica y Pensamiento Matemático

Curso profesional completo de matemática para principiantes absolutos. Diseñado para enseñar matemáticas a alguien que no sabe nada y hasta siente repulsión por ella.

## 📋 Características

- **6 Fases, 24 Módulos, 180+ Lecciones** - Desde conteo básico hasta cálculo y pensamiento matemático avanzado
- **Diseñado para cero experiencia** - Comienza con subitizing (reconocer cantidad sin contar)
- **Extremadamente intuitivo** - Analogías cotidianas, un concepto a la vez
- **Fórmulas LaTeX con hover** - Pasa el mouse sobre cualquier símbolo para ver qué significa
- **Gráficas interactivas** - Funciones, parábolas, integrales con deslizadores en tiempo real
- **Diplomas honorarios** - Certificados por lección, módulo, fase y curso completo (verificables)
- **Sin ansiedad matemática** - Sin temporizadores, reintentos ilimitados, mentalidad de crecimiento
- **PWA** - Funciona sin conexión, instalable en móvil y desktop
- **GitHub Pages + GitHub Actions** - Despliegue automático

## 🎓 Estructura del Curso

| Fase | Título | Módulos | Lecciones |
|------|--------|---------|-----------|
| 0 | Los Números Son Tus Amigos | 4 | 20 |
| 1 | El Lenguaje de los Patrones | 4 | 30 |
| 2 | Resolver Misterios (Álgebra) | 4 | 30 |
| 3 | Arquitecto de Formas (Geometría) | 4 | 30 |
| 4 | Navegante del Cambio (Cálculo) | 4 | 35 |
| 5 | Analista de Datos (Estadística) | 4 | 25 |
| 6 | Pensador Matemático | 4 | 20 |

**Total: 24 módulos, ~180 lecciones, ~60 horas de estudio**

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con recarga en caliente
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview

# Linting
npm run lint

# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e
```

### Despliegue en GitHub Pages

1. Sube este repositorio a GitHub
2. Ve a Settings > Pages
3. Selecciona "GitHub Actions" como fuente
4. Haz push a la rama `main`
5. El workflow `.github/workflows/deploy.yml` se encargará del resto

Tu sitio estará en: `https://usuario.github.io/repo/`

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Vanilla JavaScript (ES6+ Modules) |
| Estilos | CSS3 Custom Properties (Design System) |
| Math Rendering | KaTeX |
| Gráficas | function-plot.js (D3-based) |
| Persistencia | IndexedDB (Dexie.js) + LocalStorage |
| Build | Vite |
| Despliegue | GitHub Actions → GitHub Pages |
| PWA | Service Worker + Web App Manifest |
| PDF | jsPDF + QRCode |

## 📁 Estructura del Proyecto

```
├── index.html                    # Entry point (SPA)
├── vite.config.js                # Configuración de Vite
├── package.json                  # Dependencias
├── .github/workflows/deploy.yml  # CI/CD para GitHub Pages
├── public/                       # Assets estáticos
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   └── assets/                   # Iconos, imágenes
├── src/
│   ├── main.js                   # Bootstrap de la aplicación
│   ├── router.js                 # Router hash-based SPA
│   ├── store/                    # Gestión de estado
│   │   ├── index.js              # Store principal
│   │   ├── progress.js           # Progreso (IndexedDB)
│   │   ├── achievements.js       # Logros y diplomas
│   │   └── settings.js           # Configuración de usuario
│   ├── components/
│   │   ├── layout/               # Layout, Header, Sidebar, Footer
│   │   ├── math/                 # LatexRenderer, FormulaExplorer, InteractiveGraph
│   │   ├── course/               # (próximamente)
│   │   └── ui/                   # Componentes base (globals.css)
│   ├── pages/                    # Páginas: Home, Dashboard, Phase, Module, Lesson, Quiz, Practice, Diploma, Profile, Settings
│   ├── courses/math-fundamentals/
│   │   ├── manifest.json         # Metadatos del curso
│   │   └── phases/               # phase-0.json, m0-1.json, etc.
│   ├── data/                     # glossary.json, formulas.json, analogies.json, misconceptions.json
│   ├── styles/                   # variables.css, reset.css, globals.css, themes/
│   └── utils/                    # Utilidades (latex, math, storage, animation)
└── dist/                         # Build output
```

## 🎯 Diseño Pedagógico

Basado en ciencia del aprendizaje:

- **Carga cognitiva gestionada**: Micro-lecciones de 5-7 min
- **Andamiaje**: Guiado → Semi-guiado → Independiente
- **Práctica espaciada**: Algoritmo SM-2 para revisión
- **Recuperación activa**: Preguntas antes de explicar
- **Feedback inmediato**: Explicación por opción (correcta/incorrecta)
- **Mentalidad de crecimiento**: Lenguaje "aún no" vs "no puedo"
- **Reducción de ansiedad**: Sin temporizadores, reintentos ilimitados

## 🏆 Sistema de Diplomas

- **Medalla de Lección** (🥉) - Por lección completada
- **Insignia de Módulo** (🥈) - Por módulo completo + quiz ≥75%
- **Certificado de Fase** (🥇) - Por fase completa + evaluación ≥80%
- **DIPLOMA DE HONOR** (🏅) - Por las 6 fases + evaluación final ≥85%

Todos los diplomas incluyen hash de verificación único y son descargables en PDF.

## 🤝 Contribución

Este es un proyecto educativo de código abierto. Las contribuciones son bienvenidas:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

CC-BY-SA-4.0 - Creative Commons Atribución-CompartirIgual 4.0 Internacional

---

**Hecho con ❤️ por Adeptus Vinictus II - Tecnoprieste de la Technostrata**

"Que el Omnissiah bendiga el acero de tus cálculos."
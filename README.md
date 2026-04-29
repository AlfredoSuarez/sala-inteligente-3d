# Sala Inteligente con IA — Render 3D interactivo

Visualización 3D interactiva (Three.js) que muestra una sala de juntas
**convencional** vs. la misma sala convertida en **sala inteligente** con
los aditamentos sugeridos en la guía de Facility Management (Abril 2026).

Punto de partida ya existente:
- 3 pantallas inteligentes Android (Samsung + LG)
- Mesa rectangular al centro
- Sillas perimetrales

Nuevos elementos añadidos al modo *Sala inteligente*:
- Logitech Rally Bar (cámara IA + audio beamforming)
- Shure MXA920 (array de micrófonos de techo)
- Neat Board 65" (pizarrón inteligente)
- Plaud NotePin (grabadora IA portátil)
- Access point WiFi 6 dedicado
- Anillo LED de cortesía para cámara

Incluye también una **vista de imagen conceptual** generada con
OpenAI DALL·E 3 como referencia estética.

## Stack

- [Three.js](https://threejs.org/) (renderer WebGL, OrbitControls)
- [Vite](https://vitejs.dev/) (bundler / dev server)
- HTML/CSS/JS plano — sin frameworks UI

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # genera ./dist
npm run preview      # sirve ./dist
```

## Despliegue en Render

Este repo incluye `render.yaml` para despliegue como **Static Site** (gratuito).

Opción A — Blueprint:
1. Conecta el repo en https://dashboard.render.com/blueprints
2. Render detecta `render.yaml` y crea el sitio.

Opción B — Manual:
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/*` → `/index.html`

## Estructura

```
src/
  main.js        # bootstrap escena, cámara, modos
  room.js        # paredes, piso, techo, plafones
  furniture.js   # mesa, sillas, 3 pantallas Samsung/LG
  smart.js       # aditamentos IA (modo "después")
  style.css
public/
  images/        # imagen DALL·E 3 conceptual
index.html
render.yaml
```

## Origen del documento

Basado en *"Salas Inteligentes con IA: Guía para Facility Management"*
(Abril 2026), referenciando:
- Software IA: Fireflies.ai, Otter.ai, Fathom, Read.ai, Microsoft Copilot,
  Google Gemini en Meet, Zoom AI Companion 3.0, Lark Minutes.
- Hardware: Logitech Rally Bar, Jabra PanaCast 50, Poly Studio,
  Yealink MeetingBar/MVC, Neat Board, Surface Hub 3, MAXHUB XBoard,
  Shure MXA920, Plaud NotePin/Note.

Presentación ejecutiva generada con **Beautiful.ai** API.

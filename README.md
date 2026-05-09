# Demo HackIAthon Frontend

Entorno React con JavaScript para trabajar el reto 2: Auditor Agentico de Facturacion de Siniestros.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Navegacion

El proyecto usa `react-router-dom` para controlar paginas internas:

- `/`: panel principal.
- `/casos`: bandeja de siniestros.
- `/reglas`: criterios iniciales del auditor.
- `/agente`: conexion con n8n.

## n8n

Crea un archivo `.env.local` tomando como base `.env.example`.

```bash
VITE_N8N_AUDITOR_EMBED_URL=https://tu-instancia-n8n/...
VITE_N8N_AUDITOR_WEBHOOK_URL=https://tu-instancia-n8n/webhook/...
```

- `VITE_N8N_AUDITOR_EMBED_URL`: URL publica para incrustar un chat, formulario o vista del workflow.
- `VITE_N8N_AUDITOR_WEBHOOK_URL`: webhook que recibe el caso seleccionado desde el frontend.

## Estructura inicial

- `src/App.jsx`: pantalla principal del auditor.
- `src/components/N8nAgentPanel.jsx`: zona para embed y webhook de n8n.
- `src/config/n8n.js`: lectura de variables de entorno para n8n.
- `src/data/auditCases.js`: casos mock para la primera iteracion.
- `src/styles.css`: estilos responsive del panel.

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
- `/archivos`: gestion de documentos de auditoria.
- `/reglas`: dashboard de reglas de negocio.
- `/agente`: conexion con n8n.

## Archivos de auditoria

La subida de documentos funciona con mocks en `localStorage` y queda lista para conectar backend.

- Formatos permitidos: PDF, CSV, XLSX y JSON.
- Tamano maximo: 10 MB.
- Documentos: factura del taller, reporte del siniestro y tarifario.
- Servicio mock: `src/services/uploadsService.js`.
- Endpoints preparados: `POST /uploads`, `GET /uploads`, `DELETE /uploads/{id}`.

## Reglas de negocio

El dashboard permite listar, crear, editar, activar/desactivar, eliminar, buscar y filtrar reglas.

- Servicio mock: `src/services/businessRulesService.js`.
- Catalogos: `src/data/businessRules.js`.
- Endpoints preparados: `GET /business-rules`, `POST /business-rules`, `PUT /business-rules/{id}`, `PATCH /business-rules/{id}/toggle`, `DELETE /business-rules/{id}`.

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
- `src/components/FileUploadSection.jsx`: carga de factura, reporte y tarifario.
- `src/components/UploadedFilesTable.jsx`: gestion de archivos cargados.
- `src/components/BusinessRulesDashboard.jsx`: dashboard CRUD de reglas.
- `src/components/BusinessRuleForm.jsx`: formulario de reglas.
- `src/components/BusinessRulesTable.jsx`: tabla de reglas.
- `src/components/BusinessRuleFilters.jsx`: filtros de reglas.
- `src/components/RuleStatsCards.jsx`: resumen de reglas.
- `src/components/N8nAgentPanel.jsx`: zona para embed y webhook de n8n.
- `src/config/n8n.js`: lectura de variables de entorno para n8n.
- `src/data/auditCases.js`: casos mock para la primera iteracion.
- `src/data/businessRules.js`: reglas iniciales y catalogos.
- `src/services/uploadsService.js`: mock temporal de archivos.
- `src/services/businessRulesService.js`: mock temporal de reglas.
- `src/styles.css`: estilos responsive del panel.

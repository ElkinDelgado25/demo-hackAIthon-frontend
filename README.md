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
- `/dashboard`: inicio del dashboard interno.
- `/dashboard/cases`: bandeja de siniestros.
- `/dashboard/files`: gestion de documentos de auditoria.
- `/dashboard/rules`: dashboard de reglas de negocio.
- `/dashboard/agent`: conexion con n8n.

Las rutas antiguas `/casos`, `/archivos`, `/reglas` y `/agente` redirigen al dashboard.

## PostgreSQL local

Levanta la base de datos local con Docker:

```bash
docker compose up -d
```

Valores por defecto:

- Base: `auditoria_siniestros`
- Usuario: `postgres`
- Password: `1234`
- Puerto: `5432`

Los scripts iniciales se ejecutan automaticamente solo la primera vez que se crea el volumen:

- `database/init/01_schema.sql`
- `database/init/02_seed.sql`

Para recrear la base desde cero:

```bash
docker compose down -v
docker compose up -d
```

## API y base en nube

El frontend consulta casos desde:

```bash
GET ${VITE_API_BASE_URL}/cases
```

Si la API falla o no existe, usa `src/data/auditCases.js` y muestra “Usando datos de demostracion”.

Para cambiar a Supabase o Google Cloud SQL en una API Node posterior, actualiza:

```bash
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_SSL=require
```

La plantilla de conexion esta en `server/db/connection.js`.

## Archivos de auditoria

La subida de documentos funciona con mocks en `localStorage` y queda lista para conectar backend.

- Formatos permitidos: PDF, CSV, XLSX, JSON, PNG y JPG.
- Tamano maximo total por auditoria: 20 MB.
- Documentos: factura del taller, reporte del siniestro y tarifario.
- Servicio mock: `src/services/uploadsService.js`.
- Endpoints preparados: `POST /uploads`, `GET /uploads`, `DELETE /uploads/{id}`.

## Consulta automatica de casos

La pagina `/dashboard/cases` ejecuta `fetchCases` al entrar y luego cada 5 minutos. Si detecta codigos nuevos respecto al estado anterior, muestra un aviso de casos nuevos.


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

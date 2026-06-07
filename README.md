# AuditIA Frontend

Frontend React + Vite para el reto AuditIA: auditor agentico de facturacion de siniestros. Esta aplicacion consume una API FastAPI externa; no se conecta directamente a MongoDB ni guarda credenciales de base de datos.

## Tabla de contenido

- Requisitos
- Arquitectura
- Instalacion local
- Variables de entorno
- Ejecutar frontend
- Ejecutar backend local
- Integracion frontend-backend
- Rutas de la aplicacion
- Endpoints consumidos
- Autenticacion
- Subida de documentos
- Build y preview
- Deploy en Vercel
- Deploy en Google Cloud Run
- Deploy del backend en Render
- Verificacion rapida
- Problemas comunes

## Requisitos

Frontend:

- Node.js 18 o superior.
- npm.
- Navegador moderno.

Backend, si tambien quieres levantarlo localmente:

- Python 3.11 o superior. El backend actual usa Python 3.13.4.
- MongoDB local o MongoDB Atlas.
- Entorno virtual `.venv`.

## Arquitectura

```text
React/Vite frontend
  -> VITE_API_BASE_URL
  -> FastAPI backend
  -> MongoDB
```

Regla importante:

- El frontend solo llama una API HTTP.
- MongoDB vive exclusivamente en el backend.
- No agregues `MONGODB_URI`, passwords, tokens privados ni claves OpenAI al frontend.
- Si el backend cambia el prefijo `/api`, tambien debe cambiar `VITE_API_BASE_URL`.

## Instalacion local del frontend

Desde PowerShell:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-frontend
npm install
```

Crear archivo de entorno local:

```powershell
Copy-Item .env.example .env.local
```

Luego edita `.env.local` segun el backend que quieras usar.

## Variables de entorno del frontend

Archivo recomendado para desarrollo local:

```text
.env.local
```

Backend desplegado en Render:

```env
VITE_API_BASE_URL=tu_link_del_backend_en_render_con_api
```

Backend local:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Notas:

- La URL debe incluir `/api`.
- El healthcheck del backend no usa `/api`: `http://localhost:8000/health`.
- `src/config/appConfig.js` tiene un fallback a Render si `VITE_API_BASE_URL` viene vacio.
- `src/config/appConfig.js` elimina barras finales para evitar URLs como `/api//cases`.

## Ejecutar frontend

Servidor local de Vite:

```powershell
npm run dev
```

URL local:

```text
http://127.0.0.1:5173
```

Si prefieres usar localhost:

```text
http://localhost:5173
```

El puerto esta definido en `vite.config.js`:

```js
server: {
  host: "127.0.0.1",
  port: 5173
}
```

## Ejecutar backend local

El backend esta en otro repositorio/carpeta:

```text
C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-backend
```

Desde PowerShell:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-backend
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Si PowerShell bloquea la activacion:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

URLs del backend local:

```text
API: http://localhost:8000
Swagger: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
OpenAPI: http://localhost:8000/api/openapi.json
Health: http://localhost:8000/health
```

Para que el frontend use ese backend local:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Variables del backend local

En el backend, crea `.env` desde `.env.example`:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-backend
Copy-Item .env.example .env
```

Variables principales del backend:

```env
APP_NAME=AuditIA API
ENVIRONMENT=development
API_PREFIX=/api
BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=auditoria_siniestros

AUTH_REQUIRED=false
JWT_SECRET_KEY=change-me-use-a-long-random-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

UPLOAD_MAX_TOTAL_BYTES=20971520
UPLOAD_ALLOWED_EXTENSIONS=pdf,csv,xlsx,json,png,jpg,jpeg
UPLOAD_LOCAL_DIR=storage/uploads

DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=change-me
DEFAULT_ADMIN_FULL_NAME=AuditIA Admin

OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.1
CHROMA_COLLECTION=auditia_documents
```

En produccion, cambia `JWT_SECRET_KEY`, configura `MONGODB_URI` real y no subas `.env` a Git.

## Integracion frontend-backend

El frontend consume servicios desde:

- `src/config/appConfig.js`: base URL de API.
- `src/config/database.js`: endpoints.
- `src/services/apiClient.js`: cliente HTTP, errores y token opcional.
- `src/services/caseService.js`: casos.
- `src/services/uploadService.js`: documentos.
- `src/services/auditService.js`: auditorias.
- `src/services/businessRuleService.js`: reglas de negocio.
- `src/services/statisticsService.js`: dashboard.

El backend debe responder en `camelCase`, por ejemplo:

```json
{
  "claimNumber": "SIN-2026-001",
  "reportedDamages": ["parachoques"],
  "invoiceTotal": 1200,
  "tariffTotal": 1100
}
```

El frontend tiene normalizadores para algunos alias antiguos, pero el contrato recomendado es `camelCase`.

## Rutas de la aplicacion

- `/`: landing publica.
- `/dashboard`: dashboard general.
- `/dashboard/cases`: bandeja de casos.
- `/dashboard/cases/:caseId`: detalle de caso.
- `/dashboard/cases/:caseId/upload`: subida documental y auditoria.
- `/dashboard/cases/:caseId/result`: resultado de auditoria.
- `/dashboard/cases/:caseId/history`: historial del caso.
- `/dashboard/files`: entrada documental desde casos.
- `/dashboard/rules`: reglas de negocio.
- `/dashboard/history`: historial por `caseId` en query string.

Redirecciones soportadas:

- `/casos` -> `/dashboard/cases`
- `/archivos` -> `/dashboard/files`
- `/reglas` -> `/dashboard/rules`
- `/agente` -> `/dashboard`
- `/cases` -> `/dashboard/cases`
- `/files` -> `/dashboard/files`
- `/dashboard/agent` -> `/dashboard`

## Endpoints consumidos

Todos estos endpoints se concatenan con `VITE_API_BASE_URL`.

Casos:

```text
GET /cases
GET /cases/{caseId}
POST /cases
PATCH /cases/{caseId}/status
```

Documentos:

```text
GET /cases/{caseId}/documents
POST /cases/{caseId}/documents
```

Auditorias:

```text
POST /audit/{caseId}
GET /audit/{caseId}/latest
GET /audit/{caseId}/history
```

Reglas de negocio:

```text
GET /business-rules
POST /business-rules
PUT /business-rules/{ruleId}
PATCH /business-rules/{ruleId}/toggle
DELETE /business-rules/{ruleId}
```

Estadisticas:

```text
GET /statistics/dashboard
GET /statistics/denial-reasons
```

Auth disponible en backend:

```text
POST /auth/register
POST /auth/login
GET /auth/me
```

## Autenticacion

El backend puede funcionar con:

```env
AUTH_REQUIRED=false
```

En ese modo, el frontend no necesita login para demo/desarrollo.

Si backend activa:

```env
AUTH_REQUIRED=true
```

Entonces el frontend debe enviar:

```http
Authorization: Bearer <accessToken>
```

`src/services/apiClient.js` ya agrega el header automaticamente si encuentra alguno de estos valores en `localStorage`:

- `accessToken`
- `authToken`

Ejemplo manual para pruebas desde consola del navegador:

```js
localStorage.setItem("accessToken", "TOKEN_AQUI");
```

## Subida de documentos

Formatos permitidos:

- PDF
- CSV
- XLSX
- JSON
- PNG
- JPG
- JPEG

Limite total por auditoria:

```text
20 MB
```

Tipos de documento obligatorios:

```text
FACTURA
ORDEN_REPARACION
DETALLE_MANO_OBRA
FOTOS_DANIO
```

`POST /cases/{caseId}/documents` usa `multipart/form-data`:

- `files`: uno o varios archivos.
- `documents`: JSON serializado con metadata.

Ejemplo del campo `documents`:

```json
[
  {
    "name": "factura.pdf",
    "type": "FACTURA",
    "size": 123456,
    "mimeType": "application/pdf"
  }
]
```

Despues de subir documentos, el frontend ejecuta:

```text
POST /audit/{caseId}
```

Payload de auditoria:

```json
{
  "caseId": "SIN-2026-001",
  "vehicle": {
    "plate": "ABC-1234",
    "model": "Toyota Corolla"
  },
  "reportedDamages": ["parachoques"],
  "documents": [],
  "requestedBy": "Taller",
  "source": "frontend-dashboard"
}
```

## Respuestas esperadas

Listado de casos:

```json
{
  "cases": []
}
```

Estadisticas:

```json
{
  "totalCases": 0,
  "approvedCases": 0,
  "observedCases": 0,
  "deniedCases": 0,
  "humanReviewCases": 0,
  "approvalRate": 0,
  "latestAudits": []
}
```

Razones de negacion:

```json
{
  "reasons": []
}
```

Reglas:

```json
{
  "rules": []
}
```

Errores:

```json
{
  "detail": "Mensaje del error."
}
```

Las listas vacias y contadores en `0` son respuestas validas. No significan error de conexion.

## Build y preview

Crear build de produccion:

```powershell
npm run build
```

Previsualizar build:

```powershell
npm run preview
```

El build se genera en:

```text
dist/
```

## Deploy en Vercel

Configuracion recomendada:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variable en Vercel:

```env
VITE_API_BASE_URL=https://demo-hackaithon-backend.onrender.com/api
```

Despues de cambiar variables en Vercel, haz redeploy.

`vercel.json` esta configurado para SPA fallback:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esto permite refrescar rutas como `/dashboard/cases` sin recibir 404.

## Deploy en Google Cloud Run

El frontend esta preparado para Cloud Run con `Dockerfile` y Nginx.

En la pantalla de configuracion desde GitHub:

```text
Rama: main
Tipo de compilacion: Dockerfile
Directorio de contexto de compilacion: /
Dockerfile: /Dockerfile
Puerto del contenedor: 8080
```

No configures `Objetivo de la funcion`; este repositorio es una aplicacion web, no una Cloud Function.

Variable recomendada en Cloud Run:

```env
VITE_API_BASE_URL=https://demo-hackaithon-backend.onrender.com/api
```

Cloud Run puede cambiar esta variable sin reconstruir la imagen porque el contenedor genera `/env-config.js` al iniciar.

## Deploy del backend en Render

Resumen para el backend FastAPI:

```text
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Variables importantes en Render:

```env
PYTHON_VERSION=3.13.4
MONGODB_URI=mongodb+srv://...
MONGODB_DB=auditoria_siniestros
JWT_SECRET_KEY=un-secreto-largo-y-seguro
AUTH_REQUIRED=false
BACKEND_CORS_ORIGINS=https://tu-frontend.vercel.app,http://localhost:5173,http://127.0.0.1:5173
OPENAI_API_KEY=...
```

Healthcheck del backend desplegado:

```text
https://demo-hackaithon-backend.onrender.com/health
```

Documentacion OpenAPI:

```text
https://demo-hackaithon-backend.onrender.com/docs
https://demo-hackaithon-backend.onrender.com/api/openapi.json
```

## Verificacion rapida

Backend desplegado:

```powershell
Invoke-RestMethod https://demo-hackaithon-backend.onrender.com/health
Invoke-RestMethod https://demo-hackaithon-backend.onrender.com/api/cases
Invoke-RestMethod https://demo-hackaithon-backend.onrender.com/api/statistics/dashboard
Invoke-RestMethod https://demo-hackaithon-backend.onrender.com/api/business-rules
```

Backend local:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/api/cases
Invoke-RestMethod http://localhost:8000/api/statistics/dashboard
Invoke-RestMethod http://localhost:8000/api/business-rules
```

Frontend:

```powershell
npm run build
npm run dev
```

## Problemas comunes

### El frontend no carga datos

Revisa:

- `.env.local` tiene `VITE_API_BASE_URL` correcto.
- La URL incluye `/api`.
- Backend responde `/health`.
- Backend tiene CORS para `http://localhost:5173` y `http://127.0.0.1:5173`.
- En Vercel, la variable fue guardada y se hizo redeploy.

### Error 401

El backend puede tener `AUTH_REQUIRED=true`. Debes iniciar sesion o guardar un token valido en `localStorage.accessToken`.

### Error de CORS

En backend agrega el origen del frontend:

```env
BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://tu-frontend.vercel.app
```

### MongoDB no conecta

Ese problema se corrige en backend:

- Verifica `MONGODB_URI`.
- Verifica acceso de red en MongoDB Atlas.
- Verifica usuario/password.
- Verifica que Render tenga las variables correctas.

### PowerShell no activa `.venv`

Ejecuta:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### El build falla por dependencias

Reinstala:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run build
```

Usa este bloque solo si necesitas regenerar dependencias. No lo ejecutes si tienes cambios importantes sin guardar.

## Comandos resumidos

Frontend con backend desplegado:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Frontend con backend local:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-frontend
Set-Content .env.local "VITE_API_BASE_URL=http://localhost:8000/api"
npm run dev
```

Backend local:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-backend
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Build final:

```powershell
cd C:\Users\Usuario\Desktop\2026-01\demo-hackAIthon-frontend
npm run build
```

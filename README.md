# Demo HackIAthon Frontend

Frontend React + Vite para el reto 2: Auditor Agentico de Facturacion de Siniestros.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Variables de entorno

Crea `.env.local` tomando como base `.env.example`.

```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=true
VITE_ALLOW_MOCK_FALLBACK=true
```

- `VITE_USE_MOCKS=true`: usa datos locales para demo.
- `VITE_USE_MOCKS=false`: consume el backend definido en `VITE_API_BASE_URL`.
- `VITE_ALLOW_MOCK_FALLBACK=true`: si la API falla, permite volver a mocks para no bloquear la demo.

Para conectar luego con FastAPI:

```bash
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api
```

## Rutas

La landing y el dashboard usan layouts separados:

- `/`: landing publica con navbar superior.
- `/dashboard`: inicio interno con sidebar.
- `/dashboard/cases`: casos asignados.
- `/dashboard/cases/:caseId`: detalle del caso.
- `/dashboard/cases/:caseId/upload`: subida de documentos y auditoria.
- `/dashboard/cases/:caseId/result`: resultado de auditoria.
- `/dashboard/files`: gestion general de documentos.
- `/dashboard/rules`: reglas de negocio.
- `/dashboard/history`: historial de auditorias.
- `/dashboard/agent`: integracion con n8n.

Las rutas antiguas `/casos`, `/archivos`, `/reglas` y `/agente` redirigen al dashboard.

## Flujo de demo

1. Abre `/`.
2. Pulsa `Iniciar auditoria`.
3. Entra a `/dashboard`.
4. Ve a `Casos`.
5. Selecciona un caso y entra a `Subir documentos`.
6. Agrega los documentos obligatorios.
7. Pulsa `Subir y auditar`.
8. Revisa el resultado en `/dashboard/cases/:caseId/result`.

## Subida de documentos

La subida funciona con mocks en `localStorage` y queda preparada para API.

- Formatos permitidos: PDF, CSV, XLSX, JSON, PNG, JPG y JPEG.
- Tamano maximo total por auditoria: 20 MB.
- Documentos obligatorios: `FACTURA`, `ORDEN_REPARACION`, `DETALLE_MANO_OBRA`, `FOTOS_DANIO`.
- Boton principal: `Subir y auditar`.
- Servicio base: `src/services/uploadService.js`.
- Mock local: `src/services/uploadsService.js`.

Payload preparado para FastAPI:

```json
{
  "caseId": "SIN-2026-001",
  "vehicle": {
    "plate": "ABC-1234",
    "model": "Toyota Corolla 2020"
  },
  "reportedDamages": [],
  "documents": [
    {
      "name": "factura.pdf",
      "type": "FACTURA",
      "size": 123456,
      "mimeType": "application/pdf"
    }
  ],
  "requestedBy": "Taller",
  "source": "frontend-dashboard"
}
```

## Servicios

Las llamadas externas estan centralizadas para cambiar entre mocks y API real sin tocar componentes principales.

- `src/services/apiClient.js`: cliente HTTP para FastAPI.
- `src/services/caseService.js`: casos y polling.
- `src/services/uploadService.js`: interfaz de subida.
- `src/services/auditService.js`: ejecucion y resultados de auditoria.
- `src/services/businessRuleService.js`: reglas de negocio con API o mock.
- `src/config/appConfig.js`: lectura de variables Vite.

Endpoints esperados para FastAPI:

- `GET /cases`
- `GET /cases/:id`
- `POST /audits/run`
- `GET /audit-results/:caseId`
- `GET /business-rules`
- `POST /business-rules`
- `PUT /business-rules/:id`
- `PATCH /business-rules/:id/toggle`
- `DELETE /business-rules/:id`

## PostgreSQL local

La infraestructura SQL queda disponible para pruebas locales con Docker:

```bash
docker compose up -d
```

Valores por defecto:

- Base: `auditoria_siniestros`
- Usuario: `postgres`
- Password: `1234`
- Puerto: `5432`

Los scripts iniciales se ejecutan automaticamente la primera vez que se crea el volumen:

- `database/init/01_schema.sql`
- `database/init/02_seed.sql`

Para recrear la base desde cero:

```bash
docker compose down -v
docker compose up -d
```

## n8n

Variables disponibles:

```bash
VITE_N8N_AUDITOR_EMBED_URL=https://tu-instancia-n8n/...
VITE_N8N_AUDITOR_WEBHOOK_URL=https://tu-instancia-n8n/webhook/...
```

- `VITE_N8N_AUDITOR_EMBED_URL`: URL publica para incrustar un chat, formulario o vista del workflow.
- `VITE_N8N_AUDITOR_WEBHOOK_URL`: webhook que recibe el caso seleccionado desde el frontend.

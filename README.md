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
```

El frontend consume solo datos reales desde el backend. Si la API falla, muestra un error controlado. Si la API responde vacio, muestra `Dato no disponible`.

## Rutas

La landing y el dashboard usan layouts separados:

- `/`: landing publica con navbar superior.
- `/dashboard`: inicio interno con sidebar.
- `/dashboard/cases`: casos asignados.
- `/dashboard/cases/:caseId`: detalle del caso.
- `/dashboard/cases/:caseId/upload`: subida de documentos y auditoria.
- `/dashboard/cases/:caseId/result`: resultado de auditoria.
- `/dashboard/cases/:caseId/history`: historial del caso.
- `/dashboard/files`: acceso a gestion de documentos desde casos.
- `/dashboard/rules`: reglas de negocio.
- `/dashboard/history`: historial de auditorias por `caseId` en query string.
- `/dashboard/agent`: integracion con n8n.

## Endpoints esperados

Casos:

- `GET /cases`
- `GET /cases/{caseId}`

Documentos:

- `POST /cases/{caseId}/documents`
- `GET /cases/{caseId}/documents`

Auditoria:

- `POST /audit/{caseId}`
- `GET /audit/{caseId}/latest`
- `GET /audit/{caseId}/history`

Reglas de negocio:

- `GET /business-rules`
- `POST /business-rules`
- `PUT /business-rules/{ruleId}`
- `PATCH /business-rules/{ruleId}/toggle`
- `DELETE /business-rules/{ruleId}`

Estadisticas:

- `GET /statistics/dashboard`
- `GET /statistics/denial-reasons`

## Respuesta de estadisticas

`GET /statistics/dashboard` debe responder:

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

`GET /statistics/denial-reasons` debe responder:

```json
{
  "reasons": [
    {
      "reason": "Precio facturado supera el tarifario",
      "count": 12,
      "percentage": 40
    }
  ]
}
```

## Subida de documentos

- Formatos permitidos: PDF, CSV, XLSX, JSON, PNG, JPG y JPEG.
- Tamano maximo total por auditoria: 20 MB.
- Documentos obligatorios: `FACTURA`, `ORDEN_REPARACION`, `DETALLE_MANO_OBRA`, `FOTOS_DANIO`.
- Boton principal: `Subir y auditar`.
- Los archivos se envian con `multipart/form-data` a `POST /cases/{caseId}/documents`.
- La auditoria se ejecuta con `POST /audit/{caseId}`.

## PostgreSQL local

La infraestructura SQL queda disponible para pruebas locales con Docker:

```bash
docker compose up -d
```

Los scripts iniciales se ejecutan automaticamente la primera vez que se crea el volumen:

- `database/init/01_schema.sql`
- `database/init/02_seed.sql`

## n8n

Variables disponibles:

```bash
VITE_N8N_AUDITOR_EMBED_URL=https://tu-instancia-n8n/...
VITE_N8N_AUDITOR_WEBHOOK_URL=https://tu-instancia-n8n/webhook/...
```

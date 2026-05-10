# README tecnico del backend - AuditIA

Este documento especifica el backend necesario para conectar el frontend actual de AuditIA con una API real. La especificacion esta basada en las rutas, servicios, componentes, formularios, tablas, estados y flujos existentes en el frontend React/Vite de este repositorio.

No se crea backend en esta etapa. Este README funciona como documento maestro para construirlo posteriormente con FastAPI, MongoDB, Beanie ODM y autenticacion JWT.

## 1. Objetivo del backend

El backend debe centralizar la operacion real del sistema de auditoria de facturacion de siniestros:

- Gestionar casos/siniestros asignados para auditoria.
- Recibir, validar, almacenar y listar documentos asociados a un caso.
- Ejecutar auditorias sobre documentos y datos del caso.
- Persistir resultados, discrepancias, recomendaciones e historial.
- Administrar reglas de negocio configurables.
- Exponer metricas para el dashboard.
- Proteger los endpoints internos mediante JWT.
- Mantener secretos, credenciales, almacenamiento y conexiones externas fuera del frontend.

El frontend espera una API base configurable en:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## 2. Analisis del frontend actual

### Stack frontend detectado

- React 18.
- Vite.
- React Router DOM.
- Fetch API mediante `src/services/apiClient.js`.
- `lucide-react` para iconografia.
- CSS propio en `src/styles.css`.

### Rutas principales

| Ruta | Pantalla | Necesidad backend |
| --- | --- | --- |
| `/` | Landing publica | No requiere backend. |
| `/dashboard` | Dashboard general | Estadisticas, ultimas auditorias, razones de denegacion. |
| `/dashboard/cases` | Bandeja de casos | Listado de casos, filtros frontend por busqueda y estado. |
| `/dashboard/cases/:caseId` | Detalle de caso | Consulta de caso por identificador. |
| `/dashboard/cases/:caseId/upload` | Subida de documentos y ejecucion de auditoria | Caso, documentos existentes, carga multipart y ejecucion de auditoria. |
| `/dashboard/cases/:caseId/result` | Resultado de auditoria | Ultima auditoria del caso o resultado recibido tras ejecutar. |
| `/dashboard/cases/:caseId/history` | Historial del caso | Auditorias historicas del caso. |
| `/dashboard/files` | Entrada de gestion documental | Actualmente muestra estado vacio y redirige a casos. |
| `/dashboard/rules` | Dashboard de reglas de negocio | CRUD, filtros, toggle y metricas locales de reglas. |
| `/dashboard/history` | Historial general condicionado por `caseId` en query string | Si no recibe `caseId`, muestra vacio. |

Tambien existen redirecciones desde `/casos`, `/archivos`, `/reglas`, `/agente`, `/cases`, `/files` y `/dashboard/agent`.

### Componentes importantes

- `DashboardLayout`: layout interno con sidebar.
- `DashboardPage`: consume estadisticas y razones de denegacion.
- `CasesPage`: consume casos, mantiene seleccion local, filtra por texto/estado y consulta cada 5 minutos.
- `CaseDetailPage`: consume detalle de un caso.
- `UploadFilesPage`: combina detalle de caso y subida de documentos.
- `FileUploadSection`: valida archivos, carga documentos, valida documentos obligatorios y ejecuta auditoria.
- `UploadedFilesTable`: muestra documentos cargados, estado y estado de extraccion IA.
- `AuditResultPage`: muestra ultima auditoria o resultado devuelto por `POST /audit/{caseId}`.
- `AuditHistoryPage`: muestra historial de auditorias por caso.
- `BusinessRulesDashboard`: administra reglas de negocio.
- `BusinessRuleForm`: formulario de creacion/edicion de reglas.
- `BusinessRulesTable`: tabla con acciones editar, activar/desactivar y eliminar.
- `RuleStatsCards`: calcula metricas locales de reglas.
- `States`: estados de carga, error, vacio y tarjetas metricas.

### Datos simulados, hardcodeados o constantes en frontend

No se detecta un dataset mock completo de casos, auditorias o documentos. El frontend ya intenta consumir API real. Sin embargo, existen constantes de negocio en React que el backend debe respetar o devolver desde endpoints futuros si se desea parametrizar:

- Tipos de regla: `PRECIO_MAXIMO`, `ITEM_DUPLICADO`, `ITEM_NO_RELACIONADO`, `CANTIDAD_MAXIMA`, `DOCUMENTO_OBLIGATORIO`, `PORCENTAJE_VARIACION`.
- Operadores: `MAYOR_QUE`, `MENOR_QUE`, `IGUAL_A`, `DIFERENTE_DE`, `CONTIENE`, `NO_CONTIENE`.
- Severidades: `BAJA`, `MEDIA`, `ALTA`, `CRITICA`.
- Estados de regla: `ACTIVA`, `INACTIVA`.
- Tipos de documento obligatorios: `FACTURA`, `ORDEN_REPARACION`, `DETALLE_MANO_OBRA`, `FOTOS_DANIO`.
- Extensiones permitidas: `pdf`, `csv`, `xlsx`, `json`, `png`, `jpg`, `jpeg`.
- Tamano maximo total por auditoria: 20 MB.
- Estados de caso usados por filtros: `NUEVO`, `PENDIENTE_DOCUMENTOS`, `LISTO_PARA_AUDITORIA`, `EN_AUDITORIA`, `OBSERVADO`, `APROBADO`, `DENEGADO`, `REVISION_HUMANA`.
- `requestedBy` se envia como `"Taller"`.
- `source` se envia como `"frontend-dashboard"`.
- Landing publica usa textos/tarjetas hardcodeadas y no necesita API.

## 3. Modulos de negocio detectados

1. Autenticacion y usuarios.
2. Casos o siniestros.
3. Documentos del caso.
4. Auditorias.
5. Reglas de negocio.
6. Estadisticas del dashboard.
7. Historial/auditoria operacional.

## 4. Stack recomendado

- Python 3.12+.
- FastAPI.
- Uvicorn.
- MongoDB.
- Beanie ODM sobre Motor.
- Pydantic v2.
- PyJWT o `python-jose` para JWT.
- Passlib con bcrypt para hash de passwords.
- `python-multipart` para carga de archivos.
- Almacenamiento local en desarrollo y S3/GCS/Azure Blob en produccion si se requiere.
- Pytest + HTTPX para pruebas.
- Ruff para lint/format.

## 5. Arquitectura sugerida

Arquitectura modular por dominio con separacion entre API, servicios, modelos y repositorios.

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      errors.py
      logging.py
    db/
      mongodb.py
      indexes.py
    api/
      v1/
        router.py
        auth.py
        cases.py
        documents.py
        audits.py
        business_rules.py
        statistics.py
    models/
      user.py
      case.py
      document.py
      audit.py
      business_rule.py
    schemas/
      auth.py
      cases.py
      documents.py
      audits.py
      business_rules.py
      statistics.py
      common.py
    services/
      auth_service.py
      case_service.py
      document_service.py
      audit_service.py
      rule_engine.py
      statistics_service.py
      storage_service.py
    repositories/
      case_repository.py
      document_repository.py
      audit_repository.py
      rule_repository.py
    tests/
      test_cases.py
      test_documents.py
      test_audits.py
      test_business_rules.py
```

Regla practica: las rutas FastAPI solo deben validar entrada/salida y delegar. La logica de negocio debe vivir en servicios.

## 6. Entidades principales

### User

Necesario para JWT y trazabilidad de acciones internas.

```python
class User(Document):
    email: EmailStr
    full_name: str
    hashed_password: str
    role: Literal["ADMIN", "AUDITOR", "WORKSHOP"]
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
```

### Case

Representa el siniestro o expediente a auditar.

```python
class Case(Document):
    claim_number: str
    workshop: str | None = None
    vehicle: dict
    plate: str | None = None
    reported_damages: list[str] = []
    invoice_total: float | None = None
    tariff_total: float | None = None
    status: Literal[
        "NUEVO",
        "PENDIENTE_DOCUMENTOS",
        "LISTO_PARA_AUDITORIA",
        "EN_AUDITORIA",
        "OBSERVADO",
        "APROBADO",
        "DENEGADO",
        "REVISION_HUMANA",
    ]
    confidence: float | None = None
    findings: list[dict] = []
    received_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
```

Campos esperados por el frontend:

- `id` o `caseId`.
- `claimNumber`.
- `workshop`.
- `vehicle` como string o `{ "model": "..." }`.
- `plate`.
- `reportedDamages`.
- `invoiceTotal`.
- `tariffTotal`.
- `status`.
- `confidence`.
- `findings`.
- `receivedAt`.

### CaseDocument

Documento cargado para una auditoria.

```python
class CaseDocument(Document):
    case_id: PydanticObjectId
    case_claim_number: str
    document_type: Literal["FACTURA", "ORDEN_REPARACION", "DETALLE_MANO_OBRA", "FOTOS_DANIO"]
    name: str
    size: int
    mime_type: str
    extension: str
    storage_path: str
    status: Literal["cargado", "pendiente", "procesado", "error"] = "cargado"
    extraction_status: str | None = None
    uploaded_by: PydanticObjectId | None = None
    uploaded_at: datetime
```

Campos esperados por el frontend:

- `id` o `documentId`.
- `caseId` o `auditNumber`.
- `documentType` o `type`.
- `name`, `filename` o `fileName`.
- `size`.
- `mimeType`.
- `uploadedAt`.
- `status`.
- `extractionStatus`.

### Audit

Resultado de una ejecucion de auditoria.

```python
class Audit(Document):
    audit_id: str
    case_id: PydanticObjectId
    case_claim_number: str
    status: Literal["APROBADO", "OBSERVADO", "DENEGADO", "REVISION_HUMANA"]
    confidence: float
    summary: str
    discrepancies: list[dict] = []
    recommendation: str | None = None
    documents: list[dict] = []
    executed_by: PydanticObjectId | None = None
    source: str | None = None
    created_at: datetime
```

Respuesta esperada por el frontend:

```json
{
  "auditId": "AUD-2026-0001",
  "caseId": "SIN-2026-0148",
  "status": "OBSERVADO",
  "confidence": 0.91,
  "summary": "Se detectaron diferencias entre factura y tarifario.",
  "discrepancies": [
    {
      "type": "PRECIO_MAXIMO",
      "message": "El valor facturado supera el tarifario.",
      "severity": "ALTA"
    }
  ],
  "recommendation": "Solicitar correccion de factura o soporte adicional.",
  "createdAt": "2026-05-10T12:00:00Z"
}
```

### BusinessRule

Regla configurable desde `/dashboard/rules`.

```python
class BusinessRule(Document):
    name: str
    description: str
    type: Literal[
        "PRECIO_MAXIMO",
        "ITEM_DUPLICADO",
        "ITEM_NO_RELACIONADO",
        "CANTIDAD_MAXIMA",
        "DOCUMENTO_OBLIGATORIO",
        "PORCENTAJE_VARIACION",
    ]
    target_field: str
    operator: Literal["MAYOR_QUE", "MENOR_QUE", "IGUAL_A", "DIFERENTE_DE", "CONTIENE", "NO_CONTIENE"]
    reference_value: str
    severity: Literal["BAJA", "MEDIA", "ALTA", "CRITICA"]
    status: Literal["ACTIVA", "INACTIVA"] = "ACTIVA"
    alert_message: str
    created_at: datetime
    updated_at: datetime
```

Payload que envia el frontend:

```json
{
  "name": "Precio maximo de repuesto",
  "description": "Valida que el precio facturado no supere el tarifario.",
  "type": "PRECIO_MAXIMO",
  "targetField": "invoice.items.price",
  "operator": "MAYOR_QUE",
  "referenceValue": "tarifario",
  "severity": "ALTA",
  "status": "ACTIVA",
  "alertMessage": "Precio facturado supera el valor permitido."
}
```

## 7. Relaciones entre entidades

- Un `User` puede cargar muchos `CaseDocument`.
- Un `Case` tiene muchos `CaseDocument`.
- Un `Case` tiene muchas `Audit`.
- Una `Audit` pertenece a un `Case`.
- Una `Audit` evalua documentos y reglas activas en el momento de ejecucion.
- Una `BusinessRule` puede generar muchas discrepancias en auditorias, pero no necesita relacion directa obligatoria; se recomienda guardar snapshot de la regla aplicada dentro de la discrepancia para preservar historial.

## 8. Procesos de negocio

### Bandeja de casos

1. Frontend abre `/dashboard/cases`.
2. Consume `GET /cases`.
3. Filtra localmente por texto y estado.
4. Cada 5 minutos vuelve a consultar para detectar casos nuevos.
5. El backend debe devolver casos ordenados por fecha de recepcion o actualizacion descendente.

### Detalle de caso

1. Frontend navega a `/dashboard/cases/{caseId}`.
2. Consume `GET /cases/{caseId}`.
3. `caseId` puede ser `claimNumber` segun el uso actual.
4. El backend debe resolver por `_id` o `claim_number` para evitar errores de integracion.

### Carga documental

1. Frontend consulta documentos existentes con `GET /cases/{caseId}/documents`.
2. Usuario selecciona archivos.
3. Frontend valida extension, tamano y documentos obligatorios.
4. Frontend envia `multipart/form-data` a `POST /cases/{caseId}/documents`.
5. El backend debe repetir las validaciones del frontend.
6. La respuesta debe devolver la lista normalizada de documentos del caso.

### Ejecucion de auditoria

1. Frontend valida que existan documentos obligatorios.
2. Frontend ejecuta `POST /audit/{caseId}` con datos del caso y documentos.
3. Backend cambia el caso a `EN_AUDITORIA`.
4. Backend obtiene documentos reales y reglas `ACTIVA`.
5. Backend ejecuta motor de reglas.
6. Backend guarda `Audit`.
7. Backend actualiza estado del caso segun resultado.
8. Backend responde con el resultado.
9. Frontend navega a `/dashboard/cases/{caseId}/result`.

### Reglas de negocio

1. Frontend consume `GET /business-rules`.
2. Permite crear, editar, activar/desactivar y eliminar.
3. Las metricas de reglas se calculan en frontend con el listado recibido.
4. El backend debe validar enums y campos obligatorios.
5. El motor de auditoria solo debe usar reglas `ACTIVA`.

## 9. Reglas de negocio detectadas

- No auditar sin documentos.
- Antes de auditar deben existir los documentos: `FACTURA`, `ORDEN_REPARACION`, `DETALLE_MANO_OBRA`, `FOTOS_DANIO`.
- Formatos permitidos: PDF, CSV, XLSX, JSON, PNG, JPG y JPEG.
- Tamano maximo total por caso/auditoria: 20 MB.
- Las reglas inactivas no deben afectar resultados.
- Una auditoria debe quedar registrada en historial.
- El ultimo resultado debe poder consultarse por caso.
- Los errores deben responder un cuerpo JSON con `detail` o `message`.
- Los valores faltantes deben poder ser `null` o string vacio; el frontend mostrara `Dato no disponible`.

## 10. Endpoints REST necesarios

Todos los endpoints internos deben colgar de `/api`.

### Autenticacion

Aunque el frontend actual no envia token todavia, el backend debe construirse con JWT para proteger dashboard y operaciones internas.

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/auth/login` | Obtener access token. |
| `POST` | `/auth/refresh` | Renovar token si se implementa refresh. |
| `GET` | `/auth/me` | Obtener usuario autenticado. |

Ejemplo `POST /auth/login`:

```json
{
  "email": "auditor@empresa.com",
  "password": "secret"
}
```

Respuesta:

```json
{
  "accessToken": "jwt",
  "tokenType": "bearer",
  "user": {
    "id": "664f...",
    "email": "auditor@empresa.com",
    "fullName": "Auditor Interno",
    "role": "AUDITOR"
  }
}
```

### Casos

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/cases` | Listar casos. |
| `GET` | `/cases/{caseId}` | Obtener caso por `_id` o `claimNumber`. |

Respuesta recomendada `GET /cases`:

```json
{
  "cases": [
    {
      "id": "664f...",
      "claimNumber": "SIN-2026-0148",
      "workshop": "Taller Central",
      "vehicle": {
        "model": "Toyota Corolla 2020",
        "plate": "ABC-1234"
      },
      "plate": "ABC-1234",
      "reportedDamages": ["Guardachoque delantero", "Faro izquierdo"],
      "invoiceTotal": 1250,
      "tariffTotal": 980,
      "status": "OBSERVADO",
      "confidence": 91,
      "receivedAt": "2026-05-10T12:00:00Z",
      "findings": [
        {
          "id": "FND-001",
          "title": "Sobreprecio detectado",
          "detail": "Factura supera tarifario.",
          "impact": 270
        }
      ]
    }
  ]
}
```

### Documentos

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/cases/{caseId}/documents` | Listar documentos del caso. |
| `POST` | `/cases/{caseId}/documents` | Subir documentos. |

`POST /cases/{caseId}/documents` recibe:

- Campo `files`: uno o varios archivos.
- Campo `documents`: JSON serializado con metadata.

Metadata enviada por frontend:

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

Respuesta recomendada:

```json
{
  "documents": [
    {
      "id": "6650...",
      "caseId": "SIN-2026-0148",
      "documentType": "FACTURA",
      "name": "factura.pdf",
      "size": 123456,
      "type": "pdf",
      "mimeType": "application/pdf",
      "uploadedAt": "2026-05-10T12:00:00Z",
      "status": "cargado",
      "extractionStatus": "pendiente"
    }
  ]
}
```

### Auditoria

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/audit/{caseId}` | Ejecutar auditoria. |
| `GET` | `/audit/{caseId}/latest` | Obtener ultima auditoria del caso. |
| `GET` | `/audit/{caseId}/history` | Obtener historial del caso. |

Payload enviado por frontend:

```json
{
  "caseId": "SIN-2026-0148",
  "vehicle": {
    "plate": "ABC-1234",
    "model": "Toyota Corolla 2020"
  },
  "reportedDamages": ["Guardachoque delantero"],
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

Respuesta `GET /audit/{caseId}/history`:

```json
{
  "history": [
    {
      "auditId": "AUD-2026-0001",
      "caseId": "SIN-2026-0148",
      "status": "OBSERVADO",
      "confidence": 0.91,
      "summary": "Se detectaron diferencias entre factura y tarifario.",
      "createdAt": "2026-05-10T12:00:00Z"
    }
  ]
}
```

### Reglas de negocio

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/business-rules` | Listar reglas. |
| `POST` | `/business-rules` | Crear regla. |
| `PUT` | `/business-rules/{ruleId}` | Actualizar regla. |
| `PATCH` | `/business-rules/{ruleId}/toggle` | Alternar `ACTIVA`/`INACTIVA`. |
| `DELETE` | `/business-rules/{ruleId}` | Eliminar regla. |

Respuesta `GET /business-rules`:

```json
{
  "rules": [
    {
      "id": "6651...",
      "name": "Precio maximo",
      "description": "Valida precio contra tarifario.",
      "type": "PRECIO_MAXIMO",
      "targetField": "invoice.items.price",
      "operator": "MAYOR_QUE",
      "referenceValue": "tarifario",
      "severity": "ALTA",
      "status": "ACTIVA",
      "alertMessage": "Precio facturado supera el tarifario."
    }
  ]
}
```

### Estadisticas

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/statistics/dashboard` | Metricas principales y ultimas auditorias. |
| `GET` | `/statistics/denial-reasons` | Top razones de denegacion. |

Respuesta `GET /statistics/dashboard`:

```json
{
  "totalCases": 25,
  "approvedCases": 12,
  "observedCases": 8,
  "deniedCases": 3,
  "humanReviewCases": 2,
  "approvalRate": 48,
  "latestAudits": [
    {
      "auditId": "AUD-2026-0001",
      "caseId": "SIN-2026-0148",
      "status": "OBSERVADO",
      "createdAt": "2026-05-10T12:00:00Z"
    }
  ]
}
```

Respuesta `GET /statistics/denial-reasons`:

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

## 11. Necesidades del dashboard

El dashboard consume:

- Total de casos auditados.
- Casos aprobados.
- Casos con discrepancias/observados.
- Casos denegados.
- Casos en revision humana.
- Tasa de aprobacion en porcentaje.
- Ultimas auditorias.
- Tres principales razones de denegacion.

Calculos sugeridos:

- `totalCases`: cantidad de casos con al menos una auditoria o total operativo definido por negocio.
- `approvedCases`: auditorias/casos con ultimo estado `APROBADO`.
- `observedCases`: ultimo estado `OBSERVADO`.
- `deniedCases`: ultimo estado `DENEGADO`.
- `humanReviewCases`: ultimo estado `REVISION_HUMANA`.
- `approvalRate`: `approvedCases / totalCases * 100`.
- `latestAudits`: ultimas 5 auditorias por `created_at desc`.
- `denialReasons`: agrupar discrepancias o recomendaciones de auditorias denegadas.

## 12. Autenticacion y autorizacion

El frontend actual no tiene pantalla de login ni adjunta `Authorization`. Para construir el backend escalable:

- Implementar JWT desde el inicio.
- Proteger todos los endpoints bajo `/api`, excepto login y healthcheck.
- Usar header `Authorization: Bearer <token>`.
- Definir roles iniciales: `ADMIN`, `AUDITOR`, `WORKSHOP`.
- Permisos recomendados:
  - `ADMIN`: CRUD de reglas, usuarios y acceso total.
  - `AUDITOR`: casos, documentos, auditorias, estadisticas.
  - `WORKSHOP`: carga de documentos y consulta de sus casos si aplica.

Cuando se integre login en frontend, `apiClient.js` debera agregar el token a cada request.

## 13. Variables de entorno del backend

```bash
APP_NAME=AuditIA API
ENVIRONMENT=development
API_PREFIX=/api
BACKEND_CORS_ORIGINS=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=auditoria_siniestros

JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

UPLOAD_MAX_TOTAL_BYTES=20971520
UPLOAD_ALLOWED_EXTENSIONS=pdf,csv,xlsx,json,png,jpg,jpeg
UPLOAD_STORAGE_DRIVER=local
UPLOAD_LOCAL_DIR=storage/uploads

DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=change-me
```

No reutilizar las variables PostgreSQL presentes en `.env.example`; son restos de una preparacion anterior y no corresponden al stack solicitado con MongoDB.

## 14. Flujo de integracion frontend-backend

1. Backend corre en `http://localhost:8000`.
2. API expone rutas bajo `/api`.
3. Frontend define `VITE_API_BASE_URL=http://localhost:8000/api`.
4. FastAPI habilita CORS para `http://localhost:5173`.
5. Frontend consume endpoints mediante `fetch`.
6. Backend responde JSON en estructuras compatibles:
   - Listados como array directo o `{ "items": [] }`, aunque se recomienda usar nombres del dominio: `{ "cases": [] }`, `{ "documents": [] }`, `{ "rules": [] }`, `{ "history": [] }`.
   - Errores con `{ "detail": "mensaje" }`.
7. Cuando se agregue login, frontend debe guardar token y enviarlo en `Authorization`.

## 15. Reemplazo de mocks y constantes por datos reales

El frontend no trae casos mock completos, pero hay constantes que pueden migrar gradualmente:

- Mantener por ahora enums de reglas y documentos en frontend para no romper formularios.
- Backend debe validar esos mismos enums.
- En una fase posterior se pueden crear endpoints de catalogos:
  - `GET /catalogs/document-types`
  - `GET /catalogs/rule-types`
  - `GET /catalogs/case-statuses`
- Landing publica puede seguir hardcodeada porque no participa en el flujo operativo.

Datos que deben ser reales desde el backend:

- Casos.
- Detalles de caso.
- Documentos cargados.
- Resultados de auditoria.
- Historial.
- Reglas de negocio.
- Estadisticas.
- Razones de denegacion.

## 16. Estados vacios y manejo de errores

El frontend ya contempla:

- Loading: muestra mensajes tipo `Cargando informacion...`.
- Error: muestra `No se pudo consultar la informacion. Verifique la conexion con el backend.`.
- Vacio: muestra mensajes como `No existen casos asignados actualmente.` o `Dato no disponible`.

El backend debe responder:

### Error generico

```json
{
  "detail": "No se pudo ejecutar la auditoria para este caso."
}
```

### Validacion de documentos

```json
{
  "detail": "Faltan documentos obligatorios: FACTURA, FOTOS_DANIO."
}
```

### Recurso no encontrado

```json
{
  "detail": "Caso no encontrado."
}
```

Codigos HTTP recomendados:

- `200`: consulta exitosa.
- `201`: creacion exitosa.
- `204`: eliminacion exitosa sin cuerpo.
- `400`: validacion de negocio.
- `401`: no autenticado.
- `403`: sin permisos.
- `404`: recurso no encontrado.
- `409`: conflicto de estado o duplicado.
- `413`: archivo demasiado grande.
- `422`: error de validacion Pydantic.
- `500`: error inesperado.

## 17. Indices recomendados en MongoDB

- `users.email`: unico.
- `cases.claim_number`: unico.
- `cases.status`.
- `cases.received_at`.
- `documents.case_claim_number`.
- `documents.case_id`.
- `audits.case_claim_number`.
- `audits.created_at`.
- `business_rules.status`.
- `business_rules.type`.

## 18. Recomendaciones de escalabilidad

- Mantener auditoria asincrona si el motor crece: responder `202 Accepted` y consultar estado, o usar cola con Celery/RQ/Arq.
- Guardar archivos fuera de MongoDB; Mongo debe almacenar metadata y ruta.
- Versionar reglas o guardar snapshot de reglas aplicadas en cada auditoria.
- Separar extraccion documental del motor de reglas.
- Agregar paginacion en `GET /cases`, `GET /business-rules` y historiales cuando el volumen crezca.
- Agregar filtros backend por `status`, `search`, fechas y taller aunque hoy el frontend filtre localmente.
- Usar logs estructurados con `request_id`.
- Agregar healthchecks:
  - `GET /health`
  - `GET /api/health/db`
- Preparar OpenAPI con tags por modulo.
- Cubrir con tests los flujos de documentos obligatorios, ejecucion de auditoria y CRUD de reglas.

## 19. Contrato minimo para primera version

Para que el frontend actual funcione de extremo a extremo, la primera version del backend debe implementar como minimo:

- `GET /api/cases`
- `GET /api/cases/{caseId}`
- `GET /api/cases/{caseId}/documents`
- `POST /api/cases/{caseId}/documents`
- `POST /api/audit/{caseId}`
- `GET /api/audit/{caseId}/latest`
- `GET /api/audit/{caseId}/history`
- `GET /api/business-rules`
- `POST /api/business-rules`
- `PUT /api/business-rules/{ruleId}`
- `PATCH /api/business-rules/{ruleId}/toggle`
- `DELETE /api/business-rules/{ruleId}`
- `GET /api/statistics/dashboard`
- `GET /api/statistics/denial-reasons`

Con esas rutas, el frontend actual puede operar sin mocks, mostrar datos reales, cargar documentos, ejecutar auditorias, consultar resultados y administrar reglas de negocio.

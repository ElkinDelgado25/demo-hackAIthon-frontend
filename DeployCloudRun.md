# Deploy en Google Cloud Run

Este documento resume la configuracion agregada para ejecutar el frontend React/Vite en Google Cloud Run usando Dockerfile.

## Configuracion en Cloud Run

En la pantalla de configuracion desde GitHub usa:

```text
Rama: main
Tipo de compilacion: Dockerfile
Directorio de contexto de compilacion: /
Dockerfile: /Dockerfile
Puerto del contenedor: 8080
Objetivo de la funcion: dejar vacio
```

Este repositorio es una aplicacion web, no una Cloud Function. Por eso `Objetivo de la funcion` debe quedar vacio.

## Variable de entorno

Configura esta variable en Cloud Run:

```env
VITE_API_BASE_URL=https://demo-hackaithon-backend.onrender.com/api
```

Puedes cambiar esa URL por la URL real del backend.

## Que se agrego

### `Dockerfile`

Construye la aplicacion en dos etapas:

1. Node.js instala dependencias y ejecuta `npm run build`.
2. Nginx sirve los archivos generados en `dist/`.

### `nginx.conf`

Configura Nginx para escuchar en el puerto `8080` y hacer fallback a `index.html`.

Esto evita errores 404 al refrescar rutas internas de React.

### `.dockerignore`

Evita copiar al contenedor archivos innecesarios como `node_modules`, `dist`, `.git` y variables locales.

### `.gitattributes`

Fuerza saltos de linea Linux en scripts `.sh`, Dockerfile y archivos `.conf`.

### `public/env-config.js`

Archivo publico de configuracion que React carga antes de iniciar.

### `docker/50-env-config.sh`

Script que se ejecuta al arrancar el contenedor. Genera `/env-config.js` con la variable `VITE_API_BASE_URL` tomada desde Cloud Run.

## Que se modifico

### `index.html`

Se agrego:

```html
<script src="/env-config.js"></script>
```

Esto permite cargar configuracion runtime antes de iniciar React.

### `src/config/appConfig.js`

Ahora primero intenta leer:

```js
window.__APP_CONFIG__?.VITE_API_BASE_URL
```

Si no existe, usa:

```js
import.meta.env.VITE_API_BASE_URL
```

Y si tampoco existe, usa el fallback configurado en el archivo.

### `package.json`

Se agrego:

```json
"start": "vite preview --host 0.0.0.0 --port 8080"
```

Esto queda como respaldo para ejecutar la app en el puerto usado por Cloud Run.

## Como verificar

Ejecuta:

```powershell
npm run build
```

Si el build termina correctamente, el frontend queda listo para que Cloud Run lo construya desde GitHub.

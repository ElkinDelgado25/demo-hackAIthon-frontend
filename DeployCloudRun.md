# Deploy en Google Cloud Run

Este documento explica que se configuro para desplegar el frontend React/Vite en Google Cloud Run y que cambios se hicieron en el codigo.

## Objetivo

Preparar este frontend para ejecutarse en Cloud Run desde GitHub usando un contenedor Docker.

La aplicacion es un frontend React + Vite. En produccion se compila a archivos estaticos dentro de `dist/` y se sirve con Nginx.

## Configuracion recomendada en Cloud Run

Cuando Cloud Run te pida la configuracion del repositorio:

```text
Rama: main
Tipo de compilacion: Dockerfile
Directorio de contexto de compilacion: /
Dockerfile: /Dockerfile
Puerto del contenedor: 8080
Objetivo de la funcion: dejar vacio
```

Importante: no uses `Objetivo de la funcion`, porque este proyecto no es una Cloud Function. Es una aplicacion web.

## Variable de entorno

Configura esta variable en Cloud Run:

```env
VITE_API_BASE_URL=https://demo-hackaithon-backend.onrender.com/api
```

Puedes cambiar esa URL por la URL real de tu backend.

## Archivos agregados

### `Dockerfile`

Se agrego un Dockerfile con dos etapas:

1. Usa Node.js para instalar dependencias y ejecutar:

```bash
npm run build
```

2. Usa Nginx para servir los archivos generados en `dist/`.

Cloud Run necesita que el contenedor escuche un puerto. En este caso Nginx escucha el puerto `8080`.

### `nginx.conf`

Configura Nginx para:

- Servir la aplicacion desde `/usr/share/nginx/html`.
- Escuchar en el puerto `8080`.
- Redirigir rutas de React al `index.html`.

Esto evita errores 404 cuando refrescas una ruta como:

```text
/dashboard/cases
```

### `.dockerignore`

Evita copiar archivos innecesarios al contenedor, como:

```text
node_modules
dist
.git
.env
.env.local
```

Esto hace que el build sea mas limpio y evita subir variables locales al contenedor.

### `.gitattributes`

Fuerza saltos de linea correctos para scripts `.sh`, Dockerfile y archivos `.conf`.

Esto es importante porque el script dentro del contenedor se ejecuta en Linux.

### `public/env-config.js`

Archivo de configuracion publica que carga el frontend antes de iniciar React.

Contiene un valor por defecto:

```js
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "https://demo-hackaithon-backend.onrender.com/api"
};
```

### `docker/50-env-config.sh`

Script que se ejecuta cuando inicia el contenedor.

Lee la variable de entorno `VITE_API_BASE_URL` desde Cloud Run y genera este archivo dentro de Nginx:

```text
/usr/share/nginx/html/env-config.js
```

Esto permite cambiar la URL del backend desde Cloud Run sin tener que reconstruir todo el frontend.

## Archivos modificados

### `index.html`

Se agrego esta linea antes de cargar React:

```html
<script src="/env-config.js"></script>
```

Asi la app puede leer la configuracion runtime antes de iniciar.

### `src/config/appConfig.js`

Antes la app solo leia:

```js
import.meta.env.VITE_API_BASE_URL
```

Eso funciona en Vite, pero queda fijado durante el build. Para Cloud Run es mejor poder cambiar la URL del backend desde variables de entorno del servicio.

Ahora la app primero intenta leer:

```js
window.__APP_CONFIG__?.VITE_API_BASE_URL
```

Y si no existe, usa:

```js
import.meta.env.VITE_API_BASE_URL
```

Finalmente, si ninguna existe, usa el fallback:

```text
https://demo-hackaithon-backend.onrender.com/api
```

### `package.json`

Se agrego:

```json
"start": "vite preview --host 0.0.0.0 --port 8080"
```

Esto queda como respaldo si alguna vez decides desplegar con buildpacks en vez de Dockerfile.

Para Cloud Run con Dockerfile, el servidor real es Nginx.

### `README.md`

Se agrego una seccion breve con la configuracion recomendada para Google Cloud Run.

## Como probar antes de subir

Ejecuta:

```powershell
npm run build
```

Ese comando ya fue probado y compilo correctamente.

Tambien puedes probar Docker localmente si Docker Desktop esta encendido:

```powershell
docker build -t demo-hackiathon-frontend-cloudrun .
```

En esta maquina Docker estaba instalado, pero el engine Linux de Docker Desktop no estaba corriendo, por eso no se pudo completar esa prueba local.

## Pasos finales

1. Hacer commit de los cambios.
2. Subirlos a GitHub.
3. Crear o actualizar el servicio en Cloud Run.
4. Seleccionar build con Dockerfile.
5. Configurar `VITE_API_BASE_URL`.
6. Desplegar.

## Resumen rapido

Cloud Run construira la app con Node.js, generara `dist/`, servira el resultado con Nginx en el puerto `8080` y cargara la URL del backend desde la variable `VITE_API_BASE_URL`.

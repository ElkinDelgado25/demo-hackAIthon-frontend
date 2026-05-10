# API futura

Este proyecto actualmente es frontend Vite. La carpeta `server/` deja preparado el modulo de conexion para una API Node/Express posterior.

Para usarlo en un backend Node:

```bash
npm install pg
```

```js
import { createDatabasePool } from "./db/connection.js";

const pool = createDatabasePool();
```

Variables soportadas:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`

Para Supabase o Google Cloud SQL, cambia esas variables por el host, puerto, credenciales y SSL requeridos por el proveedor.

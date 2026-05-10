import pg from "pg";

const { Pool } = pg;

export function createDatabasePool(overrides = {}) {
  const config = {
    host: overrides.host ?? process.env.DB_HOST ?? "localhost",
    port: Number(overrides.port ?? process.env.DB_PORT ?? 5432),
    database: overrides.database ?? process.env.DB_NAME ?? "auditoria_siniestros",
    user: overrides.user ?? process.env.DB_USER ?? "postgres",
    password: overrides.password ?? process.env.DB_PASSWORD ?? "1234",
    ssl: resolveSslConfig(overrides.ssl ?? process.env.DB_SSL)
  };

  return new Pool(config);
}

function resolveSslConfig(value) {
  if (value === true || value === "true" || value === "require") {
    return { rejectUnauthorized: false };
  }

  return false;
}

export async function healthcheck(pool) {
  const result = await pool.query("SELECT NOW() AS now");
  return result.rows[0];
}

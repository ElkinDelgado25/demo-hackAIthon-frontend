CREATE TABLE IF NOT EXISTS aseguradoras (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  ruc VARCHAR(20),
  contacto VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talleres (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  ruc VARCHAR(20),
  ciudad VARCHAR(100),
  contacto VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_caso_siniestro') THEN
    CREATE TYPE estado_caso_siniestro AS ENUM (
      'NUEVO',
      'PENDIENTE_DOCUMENTOS',
      'LISTO_PARA_AUDITORIA',
      'EN_AUDITORIA',
      'APROBADO',
      'OBSERVADO',
      'DENEGADO',
      'REVISION_HUMANA'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS casos_siniestro (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  aseguradora_id BIGINT NOT NULL REFERENCES aseguradoras(id),
  taller_id BIGINT NOT NULL REFERENCES talleres(id),
  placa VARCHAR(20) NOT NULL,
  vehiculo VARCHAR(160) NOT NULL,
  danos_reportados TEXT NOT NULL,
  estado estado_caso_siniestro NOT NULL DEFAULT 'NUEVO',
  monto_estimado NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reglas_negocio (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo_regla VARCHAR(60) NOT NULL,
  campo_objetivo VARCHAR(120),
  operador VARCHAR(60) NOT NULL,
  valor_referencia VARCHAR(160) NOT NULL,
  severidad VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  mensaje_alerta TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
  id BIGSERIAL PRIMARY KEY,
  caso_id BIGINT NOT NULL REFERENCES casos_siniestro(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(40) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  mime_type VARCHAR(120),
  tamano_bytes BIGINT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  storage_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resultados_auditoria (
  id BIGSERIAL PRIMARY KEY,
  caso_id BIGINT NOT NULL REFERENCES casos_siniestro(id) ON DELETE CASCADE,
  estado VARCHAR(40) NOT NULL,
  score NUMERIC(5, 2),
  monto_observado NUMERIC(12, 2) NOT NULL DEFAULT 0,
  hallazgos JSONB NOT NULL DEFAULT '[]'::jsonb,
  resumen TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_auditoria (
  id BIGSERIAL PRIMARY KEY,
  caso_id BIGINT NOT NULL REFERENCES casos_siniestro(id) ON DELETE CASCADE,
  evento VARCHAR(80) NOT NULL,
  detalle TEXT,
  actor VARCHAR(120) NOT NULL DEFAULT 'sistema',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_casos_siniestro_taller_estado ON casos_siniestro(taller_id, estado);
CREATE INDEX IF NOT EXISTS idx_casos_siniestro_created_at ON casos_siniestro(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentos_caso_id ON documentos(caso_id);
CREATE INDEX IF NOT EXISTS idx_resultados_auditoria_caso_id ON resultados_auditoria(caso_id);
CREATE INDEX IF NOT EXISTS idx_historial_auditoria_caso_id ON historial_auditoria(caso_id);

INSERT INTO aseguradoras (id, nombre, ruc, contacto)
VALUES (1, 'Seguros Andina', '0999999999001', 'operaciones@segurosandina.example')
ON CONFLICT (id) DO NOTHING;

INSERT INTO talleres (id, nombre, ruc, ciudad, contacto)
VALUES (1, 'Taller Norte', '0998887776001', 'Quito', 'admin@tallernorte.example')
ON CONFLICT (id) DO NOTHING;

INSERT INTO casos_siniestro (
  codigo,
  aseguradora_id,
  taller_id,
  placa,
  vehiculo,
  danos_reportados,
  estado,
  monto_estimado,
  created_at
)
VALUES
  (
    'SIN-2026-0148',
    1,
    1,
    'PBC-4821',
    'Toyota Corolla 2021',
    'Impacto frontal leve con reemplazo de faro y parachoques.',
    'PENDIENTE_DOCUMENTOS',
    1840.00,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'SIN-2026-0152',
    1,
    1,
    'GSK-9021',
    'Kia Sportage 2023',
    'Golpe lateral derecho con pintura y pulido.',
    'LISTO_PARA_AUDITORIA',
    920.00,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'SIN-2026-0159',
    1,
    1,
    'ABC-7734',
    'Chevrolet Onix 2022',
    'Rotura de espejo izquierdo y rayones menores.',
    'NUEVO',
    360.00,
    NOW() - INTERVAL '35 minutes'
  ),
  (
    'SIN-2026-0164',
    1,
    1,
    'PDT-4412',
    'Hyundai Tucson 2020',
    'Choque posterior con dano en compuerta y sensores de reversa.',
    'REVISION_HUMANA',
    2310.00,
    NOW() - INTERVAL '10 minutes'
  )
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO reglas_negocio (
  nombre,
  descripcion,
  tipo_regla,
  campo_objetivo,
  operador,
  valor_referencia,
  severidad,
  estado,
  mensaje_alerta
)
VALUES
  (
    'Precio no supera tarifario',
    'El precio facturado no debe superar el precio acordado en el tarifario.',
    'PRECIO_MAXIMO',
    'invoice.items.price',
    'MAYOR_QUE',
    'tariff.items.price',
    'ALTA',
    'ACTIVA',
    'El precio facturado supera el tarifario acordado.'
  ),
  (
    'Item facturado duplicado',
    'No se debe cobrar dos veces el mismo item dentro de una factura.',
    'ITEM_DUPLICADO',
    'invoice.items.code',
    'IGUAL_A',
    'codigo repetido',
    'CRITICA',
    'ACTIVA',
    'Se detecto un item duplicado en la factura.'
  ),
  (
    'Reparacion relacionada al siniestro',
    'No se debe facturar una reparacion que no corresponde al dano reportado.',
    'ITEM_NO_RELACIONADO',
    'invoice.items.description',
    'NO_CONTIENE',
    'danos_reportados',
    'ALTA',
    'ACTIVA',
    'La reparacion facturada no corresponde al dano reportado.'
  ),
  (
    'Documentos obligatorios',
    'Si falta factura, reporte del siniestro o tarifario, la auditoria queda observada.',
    'DOCUMENTO_OBLIGATORIO',
    'documents.required',
    'DIFERENTE_DE',
    'factura,reporte,tarifario',
    'CRITICA',
    'ACTIVA',
    'Faltan documentos obligatorios para ejecutar la auditoria.'
  ),
  (
    'Variacion mayor al 20%',
    'Si un precio supera mas del 20% el tarifario, marcar severidad alta.',
    'PORCENTAJE_VARIACION',
    'invoice.items.priceVariation',
    'MAYOR_QUE',
    '20',
    'ALTA',
    'ACTIVA',
    'La variacion de precio supera el umbral permitido.'
  )
ON CONFLICT DO NOTHING;

INSERT INTO historial_auditoria (caso_id, evento, detalle, actor)
SELECT id, 'CASO_ASIGNADO', 'Caso asignado al taller para carga documental.', 'seed'
FROM casos_siniestro
WHERE taller_id = 1
ON CONFLICT DO NOTHING;

export const ruleTypes = [
  "PRECIO_MAXIMO",
  "ITEM_DUPLICADO",
  "ITEM_NO_RELACIONADO",
  "CANTIDAD_MAXIMA",
  "DOCUMENTO_OBLIGATORIO",
  "PORCENTAJE_VARIACION"
];

export const ruleOperators = ["MAYOR_QUE", "MENOR_QUE", "IGUAL_A", "DIFERENTE_DE", "CONTIENE", "NO_CONTIENE"];

export const ruleSeverities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

export const ruleStatuses = ["ACTIVA", "INACTIVA"];

export const initialBusinessRules = [
  {
    id: "rule-001",
    name: "Precio no supera tarifario",
    description: "El precio facturado no debe superar el precio acordado en el tarifario del taller.",
    type: "PRECIO_MAXIMO",
    targetField: "invoice.items.price",
    operator: "MAYOR_QUE",
    referenceValue: "tariff.items.price",
    severity: "ALTA",
    status: "ACTIVA",
    alertMessage: "El precio facturado supera el valor permitido por tarifario."
  },
  {
    id: "rule-002",
    name: "Item facturado duplicado",
    description: "No se debe cobrar dos veces el mismo item dentro de una factura.",
    type: "ITEM_DUPLICADO",
    targetField: "invoice.items.code",
    operator: "IGUAL_A",
    referenceValue: "codigo repetido",
    severity: "CRITICA",
    status: "ACTIVA",
    alertMessage: "Se detecto un item duplicado en la factura del taller."
  },
  {
    id: "rule-003",
    name: "Reparacion relacionada al siniestro",
    description: "No se debe facturar una reparacion que no aparece en el dano reportado.",
    type: "ITEM_NO_RELACIONADO",
    targetField: "invoice.items.description",
    operator: "NO_CONTIENE",
    referenceValue: "reportedDamage",
    severity: "ALTA",
    status: "ACTIVA",
    alertMessage: "La reparacion facturada no se relaciona con el siniestro reportado."
  },
  {
    id: "rule-004",
    name: "Documentos obligatorios",
    description: "Si falta factura, reporte o tarifario, la auditoria debe quedar observada.",
    type: "DOCUMENTO_OBLIGATORIO",
    targetField: "uploads.requiredDocuments",
    operator: "DIFERENTE_DE",
    referenceValue: "factura,reporte,tarifario",
    severity: "CRITICA",
    status: "ACTIVA",
    alertMessage: "Faltan documentos obligatorios para completar la auditoria."
  },
  {
    id: "rule-005",
    name: "Variacion mayor al 20%",
    description: "Si un precio supera en mas del 20% el tarifario, marcar severidad alta.",
    type: "PORCENTAJE_VARIACION",
    targetField: "invoice.items.priceVariation",
    operator: "MAYOR_QUE",
    referenceValue: "20",
    severity: "ALTA",
    status: "ACTIVA",
    alertMessage: "La variacion de precio supera el umbral permitido."
  }
];

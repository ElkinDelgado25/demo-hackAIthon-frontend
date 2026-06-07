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

const businessRuleLabels = {
  PRECIO_MAXIMO: "Maximum price",
  ITEM_DUPLICADO: "Duplicate item",
  ITEM_NO_RELACIONADO: "Unrelated item",
  CANTIDAD_MAXIMA: "Maximum quantity",
  DOCUMENTO_OBLIGATORIO: "Required document",
  PORCENTAJE_VARIACION: "Variation percentage",
  MAYOR_QUE: "Greater than",
  MENOR_QUE: "Less than",
  IGUAL_A: "Equals",
  DIFERENTE_DE: "Different from",
  CONTIENE: "Contains",
  NO_CONTIENE: "Does not contain",
  BAJA: "Low",
  MEDIA: "Medium",
  ALTA: "High",
  CRITICA: "Critical",
  ACTIVA: "Active",
  INACTIVA: "Inactive"
};

export function formatBusinessRuleLabel(value) {
  return businessRuleLabels[value] ?? value ?? "Data unavailable";
}

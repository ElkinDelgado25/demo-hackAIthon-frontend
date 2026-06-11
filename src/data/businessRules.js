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
  PRECIO_MAXIMO: "Precio maximo",
  ITEM_DUPLICADO: "Item duplicado",
  ITEM_NO_RELACIONADO: "Item no relacionado",
  CANTIDAD_MAXIMA: "Cantidad maxima",
  DOCUMENTO_OBLIGATORIO: "Documento obligatorio",
  PORCENTAJE_VARIACION: "Porcentaje de variacion",
  MAYOR_QUE: "Mayor que",
  MENOR_QUE: "Menor que",
  IGUAL_A: "Igual a",
  DIFERENTE_DE: "Diferente de",
  CONTIENE: "Contiene",
  NO_CONTIENE: "No contiene",
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Critica",
  ACTIVA: "Activa",
  INACTIVA: "Inactiva"
};

export function formatBusinessRuleLabel(value) {
  return businessRuleLabels[value] ?? value ?? "Dato no disponible";
}

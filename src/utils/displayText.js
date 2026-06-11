const exactLabels = {
  APPROVED: "Aprobado",
  APROBADO: "Aprobado",
  DENIED: "Denegado",
  DENEGADO: "Denegado",
  OBSERVED: "Observado",
  OBSERVADO: "Observado",
  HUMAN_REVIEW: "Revision humana",
  REVISION_HUMANA: "Revision humana",
  IN_AUDIT: "En auditoria",
  EN_AUDITORIA: "En auditoria",
  READY_FOR_AUDIT: "Listo para auditoria",
  LISTO_PARA_AUDITORIA: "Listo para auditoria",
  PENDING_DOCUMENTS: "Pendiente de documentos",
  PENDIENTE_DOCUMENTOS: "Pendiente de documentos",
  NEW: "Nuevo",
  NUEVO: "Nuevo",
  READY: "Listo",
  PENDING: "Pendiente",
  PROCESSED: "Procesado",
  UPLOADED: "Subido",
  ACTIVE: "Activa",
  INACTIVE: "Inactiva",
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
  CRITICAL: "Critica",
  INVOICE: "Factura",
  FACTURA: "Factura",
  REPAIR_ORDER: "Orden de reparacion",
  ORDEN_REPARACION: "Orden de reparacion",
  LABOR_DETAIL: "Detalle de mano de obra",
  DETALLE_MANO_OBRA: "Detalle de mano de obra",
  DAMAGE_PHOTOS: "Fotos del danio",
  FOTOS_DANIO: "Fotos del danio",
  TARIFF_SHEET: "Tarifario",
  TARIFARIO: "Tarifario",
  POLICY: "Poliza",
  POLIZA: "Poliza",
  SUPPORTING_DOCUMENT: "Documento de sustento",
  SUSTENTO_ADICIONAL: "Documento de sustento",
  MATCH: "Coincidencia",
  MISMATCH: "Diferencia",
  VALID: "Valido",
  INVALID: "Invalido",
  ERROR: "Error"
};

const phraseLabels = {
  "High risk": "Riesgo alto",
  "Needs review": "Requiere revision",
  "Ready": "Listo",
  "Approved": "Aprobado",
  "Denied": "Denegado",
  "Human review": "Revision humana",
  "Pending documents": "Pendiente de documentos",
  "Ready for audit": "Listo para auditoria",
  "In audit": "En auditoria",
  "New case": "Caso nuevo",
  "Invoice": "Factura",
  "Repair order": "Orden de reparacion",
  "Labor detail": "Detalle de mano de obra",
  "Damage photos": "Fotos del danio",
  "Tariff sheet": "Tarifario",
  "Policy": "Poliza",
  "Supporting document": "Documento de sustento",
  "Uploaded": "Subido",
  "Pending": "Pendiente",
  "Processed": "Procesado",
  "Active": "Activa",
  "Inactive": "Inactiva",
  "Critical": "Critica",
  "High": "Alta",
  "Medium": "Media",
  "Low": "Baja",
  "Risk": "Riesgo",
  "Expected": "Esperado",
  "Found": "Encontrado",
  "Difference": "Diferencia",
  "Discrepancy": "Discrepancia",
  "Discrepancies": "Discrepancias",
  "Fraud": "Fraude",
  "Duplicate": "Duplicado",
  "Required": "Obligatorio",
  "Missing": "Faltante",
  "Document": "Documento",
  "Documents": "Documentos",
  "Audit": "Auditoria",
  "Claim": "Reclamo",
  "Workshop": "Taller",
  "Vehicle": "Vehiculo",
  "Plate": "Placa",
  "Confidence": "Confianza",
  "Recommendation": "Recomendacion",
  "Final verdict": "Veredicto final",
  "No issues found": "No se encontraron problemas",
  "Manual review recommended": "Se recomienda revision manual"
};

export function displayLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "Dato no disponible";
  }

  const text = String(value).trim();
  const normalizedKey = text.toUpperCase().replace(/[\s-]+/g, "_");
  return exactLabels[normalizedKey] ?? phraseLabels[text] ?? humanizeCode(text);
}

export function displayText(value) {
  if (value === null || value === undefined || value === "") {
    return "Dato no disponible";
  }

  let text = String(value);
  const exact = displayLabel(text);
  if (exact !== humanizeCode(text) || exactLabels[text.toUpperCase().replace(/[\s-]+/g, "_")] || phraseLabels[text]) {
    return exact;
  }

  Object.entries(phraseLabels).forEach(([english, spanish]) => {
    text = text.replace(new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi"), spanish);
  });

  return text;
}

function humanizeCode(value) {
  if (!/^[A-Z0-9_ -]+$/.test(value)) {
    return value;
  }

  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/^\w|\s\w/g, (letter) => letter.toUpperCase());
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

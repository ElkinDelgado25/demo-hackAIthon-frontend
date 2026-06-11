import { RefreshCcw, Trash2 } from "lucide-react";
import { formatFileSize } from "../services/uploadService";
import { EmptyState } from "./States";

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function UploadedFilesTable({ uploads, documentOptions = [], onChangeDocumentType, onDelete, onReplace }) {
  if (uploads.length === 0) {
    return (
      <EmptyState message="No hay documentos subidos" detail="Dato no disponible" />
    );
  }

  const canManageFiles = Boolean(onDelete || onReplace);
  const canEditDocumentType = Boolean(onChangeDocumentType && documentOptions.length);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Archivo</th>
            <th>Reclamo</th>
            <th>Tamano</th>
            <th>Tipo</th>
            <th>Subido</th>
            <th>Estado</th>
            {canManageFiles ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload) => (
            <tr key={upload.id}>
              <td>
                {canEditDocumentType ? (
                  <select
                    className="inline-select"
                    value={upload.documentType}
                    onChange={(event) => onChangeDocumentType(upload.id, event.target.value)}
                    aria-label={`Tipo de documento para ${upload.name}`}
                  >
                    {documentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  documentLabel(upload.documentType)
                )}
              </td>
              <td>
                <strong>{upload.name}</strong>
                <span>Analisis: {displayFileStatus(upload.parseStatus || upload.extractionStatus) || "Dato no disponible"}</span>
                {upload.parseError ? <span>Error de analisis: {upload.parseError}</span> : null}
              </td>
              <td>{upload.auditNumber || "Dato no disponible"}</td>
              <td>{formatFileSize(upload.size)}</td>
              <td>{upload.type || "Dato no disponible"}</td>
              <td>{upload.uploadedAt ? dateFormatter.format(new Date(upload.uploadedAt)) : "Dato no disponible"}</td>
              <td>
                <span className={`file-status ${upload.status}`}>{displayFileStatus(upload.status)}</span>
              </td>
              {canManageFiles ? (
                <td>
                  <div className="row-actions">
                    {onReplace ? (
                      <label className="icon-button" title="Reemplazar archivo">
                        <RefreshCcw size={16} />
                        <input type="file" accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg,.txt" onChange={(event) => onReplace(upload, event)} />
                      </label>
                    ) : null}
                    {onDelete ? (
                      <button className="icon-button danger" type="button" onClick={() => onDelete(upload.id)} aria-label="Eliminar archivo">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function documentLabel(documentType) {
  const labels = {
    FACTURA: "Factura",
    ORDEN_REPARACION: "Orden de reparacion",
    DETALLE_MANO_OBRA: "Detalle de mano de obra",
    FOTOS_DANIO: "Fotos del danio",
    TARIFARIO: "Tarifario",
    POLIZA: "Poliza",
    SUSTENTO_ADICIONAL: "Documento de sustento"
  };

  return labels[documentType] ?? documentType ?? "Dato no disponible";
}

function displayFileStatus(status) {
  const labels = {
    cargado: "Subido",
    pendiente: "Pendiente",
    procesado: "Procesado",
    error: "Error",
    activa: "Activa",
    inactiva: "Inactiva",
    uploaded: "Subido",
    pending: "Pendiente",
    processed: "Procesado"
  };

  return labels[status] ?? status ?? "Dato no disponible";
}

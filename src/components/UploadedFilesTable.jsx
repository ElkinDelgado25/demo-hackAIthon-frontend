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
      <EmptyState message="No uploaded documents" detail="Data unavailable" />
    );
  }

  const canManageFiles = Boolean(onDelete || onReplace);
  const canEditDocumentType = Boolean(onChangeDocumentType && documentOptions.length);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>File</th>
            <th>Claim</th>
            <th>Size</th>
            <th>Type</th>
            <th>Uploaded</th>
            <th>Status</th>
            {canManageFiles ? <th>Actions</th> : null}
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
                    aria-label={`Document type for ${upload.name}`}
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
                <span>Parsing: {upload.parseStatus || upload.extractionStatus || "Data unavailable"}</span>
                {upload.parseError ? <span>Parse error: {upload.parseError}</span> : null}
              </td>
              <td>{upload.auditNumber || "Data unavailable"}</td>
              <td>{formatFileSize(upload.size)}</td>
              <td>{upload.type || "Data unavailable"}</td>
              <td>{upload.uploadedAt ? dateFormatter.format(new Date(upload.uploadedAt)) : "Data unavailable"}</td>
              <td>
                <span className={`file-status ${upload.status}`}>{displayFileStatus(upload.status)}</span>
              </td>
              {canManageFiles ? (
                <td>
                  <div className="row-actions">
                    {onReplace ? (
                      <label className="icon-button" title="Replace file">
                        <RefreshCcw size={16} />
                        <input type="file" accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg,.txt" onChange={(event) => onReplace(upload, event)} />
                      </label>
                    ) : null}
                    {onDelete ? (
                      <button className="icon-button danger" type="button" onClick={() => onDelete(upload.id)} aria-label="Delete file">
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
    FACTURA: "Invoice",
    ORDEN_REPARACION: "Repair order",
    DETALLE_MANO_OBRA: "Labor detail",
    FOTOS_DANIO: "Damage photos",
    TARIFARIO: "Tariff sheet",
    POLIZA: "Policy",
    SUSTENTO_ADICIONAL: "Supporting document"
  };

  return labels[documentType] ?? documentType ?? "Data unavailable";
}

function displayFileStatus(status) {
  const labels = {
    cargado: "Uploaded",
    pendiente: "Pending",
    procesado: "Processed",
    error: "Error",
    activa: "Active",
    inactiva: "Inactive",
    uploaded: "Uploaded",
    pending: "Pending",
    processed: "Processed"
  };

  return labels[status] ?? status ?? "Data unavailable";
}

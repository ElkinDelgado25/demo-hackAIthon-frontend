import { RefreshCcw, Trash2 } from "lucide-react";
import { formatFileSize } from "../services/uploadsService";

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function UploadedFilesTable({ uploads, onDelete, onReplace }) {
  if (uploads.length === 0) {
    return (
      <div className="empty-state">
        <strong>No hay archivos cargados</strong>
        <p>Sube factura, reporte y tarifario para preparar la auditoria automatica.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Archivo</th>
            <th>Siniestro</th>
            <th>Tamano</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload) => (
            <tr key={upload.id}>
              <td>{documentLabel(upload.documentType)}</td>
              <td>
                <strong>{upload.name}</strong>
                <span>Extraccion IA: {upload.extractionStatus}</span>
              </td>
              <td>{upload.auditNumber}</td>
              <td>{formatFileSize(upload.size)}</td>
              <td>{upload.type}</td>
              <td>{dateFormatter.format(new Date(upload.uploadedAt))}</td>
              <td>
                <span className={`file-status ${upload.status}`}>{upload.status}</span>
              </td>
              <td>
                <div className="row-actions">
                  <label className="icon-button" title="Reemplazar archivo">
                    <RefreshCcw size={16} />
                    <input type="file" accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg" onChange={(event) => onReplace(upload, event)} />
                  </label>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(upload.id)} aria-label="Eliminar archivo">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function documentLabel(documentType) {
  const labels = {
    factura: "Factura",
    reporte: "Reporte",
    tarifario: "Tarifario"
  };

  return labels[documentType] ?? documentType;
}

import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { UploadedFilesTable } from "./UploadedFilesTable";
import {
  allowedUploadExtensions,
  createUpload,
  deleteUpload,
  formatFileSize,
  getUploads,
  maxUploadSizeBytes,
  validateAuditFile
} from "../services/uploadsService";

const documentOptions = [
  { value: "factura", label: "Factura del taller" },
  { value: "reporte", label: "Reporte del siniestro" },
  { value: "tarifario", label: "Tarifario" }
];

export function FileUploadSection({ defaultAuditNumber }) {
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [auditNumber, setAuditNumber] = useState(defaultAuditNumber);
  const [documentType, setDocumentType] = useState("factura");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: "info", text: "Selecciona un documento para asociarlo a la auditoria." });

  useEffect(() => {
    getUploads().then(setUploads);
  }, []);

  const selectedFileError = useMemo(() => (selectedFile ? validateAuditFile(selectedFile) : ""), [selectedFile]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!auditNumber.trim()) {
      setMessage({ type: "error", text: "Ingresa un numero de siniestro o auditoria." });
      return;
    }

    if (!selectedFile) {
      setMessage({ type: "error", text: "Selecciona un archivo para cargar." });
      return;
    }

    if (selectedFileError) {
      setMessage({ type: "error", text: selectedFileError });
      return;
    }

    try {
      const upload = await createUpload({ file: selectedFile, auditNumber: auditNumber.trim(), documentType });
      setUploads((currentUploads) => [upload, ...currentUploads]);
      setSelectedFile(null);
      fileInputRef.current.value = "";
      setMessage({ type: "success", text: `${upload.name} fue cargado correctamente.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function handleDelete(id) {
    await deleteUpload(id);
    setUploads((currentUploads) => currentUploads.filter((upload) => upload.id !== id));
    setMessage({ type: "success", text: "Archivo eliminado de la auditoria." });
  }

  async function handleReplace(upload, event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const updatedUpload = await createUpload({
        file,
        auditNumber: upload.auditNumber,
        documentType: upload.documentType,
        replaceId: upload.id
      });

      setUploads((currentUploads) => currentUploads.map((item) => (item.id === upload.id ? updatedUpload : item)));
      setMessage({ type: "success", text: `${upload.name} fue reemplazado por ${file.name}.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="upload-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Archivos</p>
          <h2>Documentos de auditoria</h2>
        </div>
        <div className="agent-icon">
          <FileUp size={20} />
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Siniestro o auditoria
          <input value={auditNumber} onChange={(event) => setAuditNumber(event.target.value)} placeholder="SIN-2026-0148" />
        </label>

        <label>
          Tipo de documento
          <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            {documentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="file-picker">
          <UploadCloud size={20} />
          <span>{selectedFile ? selectedFile.name : "Seleccionar archivo"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.xlsx,.json"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button className="primary-action" type="submit">
          <UploadCloud size={17} />
          Cargar
        </button>
      </form>

      <div className="upload-helper">
        <span>Formatos: {allowedUploadExtensions.map((item) => item.toUpperCase()).join(", ")}</span>
        <span>Maximo: {formatFileSize(maxUploadSizeBytes)}</span>
        {selectedFile ? <span>{formatFileSize(selectedFile.size)}</span> : null}
      </div>

      {selectedFileError ? <div className="form-message error">{selectedFileError}</div> : null}
      <div className={`form-message ${message.type}`}>{message.text}</div>

      <UploadedFilesTable uploads={uploads} onDelete={handleDelete} onReplace={handleReplace} />
    </section>
  );
}

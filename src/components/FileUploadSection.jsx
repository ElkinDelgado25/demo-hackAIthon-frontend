import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { UploadedFilesTable } from "./UploadedFilesTable";
import {
  allowedUploadExtensions,
  createUpload,
  createUploads,
  deleteUpload,
  formatFileSize,
  getUploads,
  maxUploadSizeBytes,
  validateAuditFile,
  validateAuditFilesTotal
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: "info", text: "Selecciona un documento para asociarlo a la auditoria." });

  useEffect(() => {
    getUploads().then(setUploads);
  }, []);

  useEffect(() => {
    setAuditNumber(defaultAuditNumber);
  }, [defaultAuditNumber]);

  const selectedTotalBytes = useMemo(
    () => selectedFiles.reduce((total, file) => total + file.size, 0),
    [selectedFiles]
  );
  const currentAuditUploadsTotalBytes = useMemo(() => {
    const normalizedAuditNumber = auditNumber.trim();

    return uploads
      .filter((upload) => upload.auditNumber === normalizedAuditNumber)
      .reduce((total, upload) => total + upload.size, 0);
  }, [auditNumber, uploads]);

  const selectedFilesError = useMemo(() => {
    const typeError = selectedFiles.map(validateAuditFile).find(Boolean);

    if (typeError) {
      return typeError;
    }

    return validateAuditFilesTotal(selectedFiles, currentAuditUploadsTotalBytes);
  }, [currentAuditUploadsTotalBytes, selectedFiles]);

  function handleSelectFiles(event) {
    const incomingFiles = Array.from(event.target.files ?? []);

    if (incomingFiles.length === 0) {
      return;
    }

    const typeError = incomingFiles.map(validateAuditFile).find(Boolean);

    if (typeError) {
      setMessage({ type: "error", text: typeError });
      event.target.value = "";
      return;
    }

    const totalError = validateAuditFilesTotal(incomingFiles, selectedTotalBytes + currentAuditUploadsTotalBytes);

    if (totalError) {
      setMessage({ type: "error", text: totalError });
      event.target.value = "";
      return;
    }

    setSelectedFiles((currentFiles) => [...currentFiles, ...incomingFiles]);
    setMessage({ type: "success", text: `${incomingFiles.length} archivo(s) agregado(s) a la cola.` });
    event.target.value = "";
  }

  function handleRemoveSelectedFile(index) {
    setSelectedFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!auditNumber.trim()) {
      setMessage({ type: "error", text: "Ingresa un numero de siniestro o auditoria." });
      return;
    }

    if (selectedFiles.length === 0) {
      setMessage({ type: "error", text: "Selecciona al menos un archivo para cargar." });
      return;
    }

    if (selectedFilesError) {
      setMessage({ type: "error", text: selectedFilesError });
      return;
    }

    try {
      const newUploads = await createUploads({ files: selectedFiles, auditNumber: auditNumber.trim(), documentType });
      setUploads((currentUploads) => [...newUploads, ...currentUploads]);
      setSelectedFiles([]);
      fileInputRef.current.value = "";
      setMessage({ type: "success", text: `${newUploads.length} archivo(s) cargado(s) correctamente.` });
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
          <span>{selectedFiles.length ? `${selectedFiles.length} archivo(s) seleccionados` : "Seleccionar archivos"}</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg"
            onChange={handleSelectFiles}
          />
        </label>

        <button className="primary-action" type="submit">
          <UploadCloud size={17} />
          Cargar
        </button>
      </form>

      <div className="upload-helper">
        <span>Formatos: {allowedUploadExtensions.map((item) => item.toUpperCase()).join(", ")}</span>
        <span>Maximo total: {formatFileSize(maxUploadSizeBytes)}</span>
        <span>Ya cargado: {formatFileSize(currentAuditUploadsTotalBytes)}</span>
        <span>Seleccionado: {formatFileSize(selectedTotalBytes)}</span>
      </div>

      {selectedFilesError ? <div className="form-message error">{selectedFilesError}</div> : null}
      <div className={`form-message ${message.type}`}>{message.text}</div>

      {selectedFiles.length ? (
        <div className="selected-files">
          <h3>Archivos seleccionados</h3>
          {selectedFiles.map((file, index) => (
            <div className="selected-file-row" key={`${file.name}-${file.lastModified}-${index}`}>
              <div>
                <strong>{file.name}</strong>
                <span>
                  {formatFileSize(file.size)} · {(file.name.split(".").pop() ?? "archivo").toUpperCase()} · pendiente
                </span>
              </div>
              <button className="icon-button danger" type="button" onClick={() => handleRemoveSelectedFile(index)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <UploadedFilesTable uploads={uploads} onDelete={handleDelete} onReplace={handleReplace} />
    </section>
  );
}

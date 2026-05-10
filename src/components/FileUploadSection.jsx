import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runAudit } from "../services/auditService";
import {
  allowedUploadExtensions,
  createUpload,
  createUploads,
  deleteUpload,
  formatFileSize,
  getUploads,
  maxUploadSizeBytes,
  requiredDocumentTypes,
  validateAuditFile,
  validateAuditFilesTotal
} from "../services/uploadService";
import { UploadedFilesTable } from "./UploadedFilesTable";

const documentOptions = [
  { value: "FACTURA", label: "Factura" },
  { value: "ORDEN_REPARACION", label: "Orden de reparacion" },
  { value: "DETALLE_MANO_OBRA", label: "Detalle mano de obra" },
  { value: "FOTOS_DANIO", label: "Fotos del dano" }
];

export function FileUploadSection({ defaultAuditNumber, auditCase }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [auditNumber, setAuditNumber] = useState(defaultAuditNumber);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: "info", text: "Selecciona documentos para asociarlos a la auditoria." });
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    getUploads().then(setUploads);
  }, []);

  useEffect(() => {
    setAuditNumber(defaultAuditNumber);
  }, [defaultAuditNumber]);

  const selectedTotalBytes = useMemo(
    () => selectedFiles.reduce((total, item) => total + item.file.size, 0),
    [selectedFiles]
  );
  const currentAuditUploads = useMemo(() => {
    const normalizedAuditNumber = auditNumber.trim();
    return uploads.filter((upload) => upload.auditNumber === normalizedAuditNumber);
  }, [auditNumber, uploads]);
  const currentAuditUploadsTotalBytes = useMemo(
    () => currentAuditUploads.reduce((total, upload) => total + upload.size, 0),
    [currentAuditUploads]
  );

  const selectedFilesError = useMemo(() => {
    const typeError = selectedFiles.map((item) => validateAuditFile(item.file)).find(Boolean);

    if (typeError) {
      return typeError;
    }

    return validateAuditFilesTotal(
      selectedFiles.map((item) => item.file),
      currentAuditUploadsTotalBytes
    );
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

    const totalError = validateAuditFilesTotal(
      incomingFiles,
      selectedTotalBytes + currentAuditUploadsTotalBytes
    );

    if (totalError) {
      setMessage({ type: "error", text: totalError });
      event.target.value = "";
      return;
    }

    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...incomingFiles.map((file) => ({
        file,
        documentType: suggestDocumentType(file.name)
      }))
    ]);
    setMessage({ type: "success", text: `${incomingFiles.length} archivo(s) agregado(s) a la cola.` });
    event.target.value = "";
  }

  function handleRemoveSelectedFile(index) {
    setSelectedFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  function handleChangeDocumentType(index, documentType) {
    setSelectedFiles((currentFiles) =>
      currentFiles.map((item, fileIndex) => (fileIndex === index ? { ...item, documentType } : item))
    );
  }

  function validateRequiredDocuments() {
    const documentTypes = new Set([
      ...currentAuditUploads.map((upload) => upload.documentType),
      ...selectedFiles.map((item) => item.documentType)
    ]);
    const missingTypes = requiredDocumentTypes.filter((documentType) => !documentTypes.has(documentType));

    if (missingTypes.length > 0) {
      return `Faltan documentos obligatorios: ${missingTypes.join(", ")}.`;
    }

    return "";
  }

  function buildAuditPayload(documents) {
    return {
      caseId: auditNumber.trim(),
      vehicle: {
        plate: auditCase?.plate ?? "",
        model: auditCase?.vehicle ?? ""
      },
      reportedDamages: auditCase?.reportedDamages ?? [auditCase?.reportedDamage].filter(Boolean),
      documents: documents.map((document) => ({
        name: document.name,
        type: document.documentType,
        size: document.size,
        mimeType: document.mimeType
      })),
      requestedBy: "Taller",
      source: "frontend-dashboard"
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!auditNumber.trim()) {
      setMessage({ type: "error", text: "Selecciona o ingresa un numero de siniestro." });
      return;
    }

    if (selectedFiles.length === 0 && currentAuditUploads.length === 0) {
      setMessage({ type: "error", text: "Selecciona al menos un archivo para auditar." });
      return;
    }

    if (selectedFilesError) {
      setMessage({ type: "error", text: selectedFilesError });
      return;
    }

    const requiredDocumentsError = validateRequiredDocuments();

    if (requiredDocumentsError) {
      setMessage({ type: "error", text: requiredDocumentsError });
      return;
    }

    setIsAuditing(true);
    setMessage({ type: "info", text: "Ejecutando agente auditor" });

    try {
      const newUploads = selectedFiles.length
        ? await createUploads({ files: selectedFiles, auditNumber: auditNumber.trim() })
        : [];
      const documents = [...newUploads, ...currentAuditUploads];
      const payload = buildAuditPayload(documents);
      const result = await runAudit(payload);

      setUploads((currentUploads) => [...newUploads, ...currentUploads]);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage({ type: "success", text: "Auditoria ejecutada correctamente." });
      navigate(`/dashboard/cases/${auditNumber.trim()}/result`, { state: { result } });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsAuditing(false);
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
      const validationError =
        validateAuditFile(file) || validateAuditFilesTotal([file], currentAuditUploadsTotalBytes - upload.size);

      if (validationError) {
        throw new Error(validationError);
      }

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

        <button className="primary-action" type="submit" disabled={isAuditing}>
          <UploadCloud size={17} />
          {isAuditing ? "Ejecutando agente auditor" : "Subir y auditar"}
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
          {selectedFiles.map((item, index) => (
            <div className="selected-file-row" key={`${item.file.name}-${item.file.lastModified}-${index}`}>
              <div>
                <strong>{item.file.name}</strong>
                <span>
                  {formatFileSize(item.file.size)} - {(item.file.name.split(".").pop() ?? "archivo").toUpperCase()} - pendiente
                </span>
              </div>
              <select value={item.documentType} onChange={(event) => handleChangeDocumentType(index, event.target.value)}>
                {documentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

function suggestDocumentType(fileName) {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.includes("orden")) {
    return "ORDEN_REPARACION";
  }

  if (normalizedName.includes("mano") || normalizedName.includes("obra")) {
    return "DETALLE_MANO_OBRA";
  }

  if (normalizedName.includes("foto") || normalizedName.endsWith(".png") || normalizedName.endsWith(".jpg") || normalizedName.endsWith(".jpeg")) {
    return "FOTOS_DANIO";
  }

  return "FACTURA";
}

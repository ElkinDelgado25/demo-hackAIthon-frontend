import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runAudit } from "../services/auditService";
import {
  allowedUploadExtensions,
  formatFileSize,
  getDocuments,
  maxUploadSizeBytes,
  requiredDocumentTypes,
  uploadDocuments,
  validateAuditFile,
  validateAuditFilesTotal
} from "../services/uploadService";
import { ErrorState, LoadingState } from "./States";
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
  const [auditNumber, setAuditNumber] = useState(defaultAuditNumber ?? "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: "info", text: "Selecciona documentos para asociarlos a la auditoria." });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    setAuditNumber(defaultAuditNumber ?? "");
  }, [defaultAuditNumber]);

  useEffect(() => {
    const normalizedAuditNumber = auditNumber.trim();

    if (!normalizedAuditNumber) {
      setUploads([]);
      return;
    }

    let isMounted = true;
    setIsLoadingDocuments(true);
    setDocumentsError("");

    getDocuments(normalizedAuditNumber)
      .then((documents) => {
        if (isMounted) {
          setUploads(documents.map(normalizeDocument));
        }
      })
      .catch(() => {
        if (isMounted) {
          setDocumentsError("No se pudo consultar la informacion. Verifique la conexion con el backend.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auditNumber]);

  const selectedTotalBytes = useMemo(
    () => selectedFiles.reduce((total, item) => total + item.file.size, 0),
    [selectedFiles]
  );
  const currentAuditUploadsTotalBytes = useMemo(
    () => uploads.reduce((total, upload) => total + Number(upload.size ?? 0), 0),
    [uploads]
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
      ...uploads.map((upload) => upload.documentType),
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

    if (selectedFiles.length === 0 && uploads.length === 0) {
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
      const uploadResponse = selectedFiles.length ? await uploadDocuments(auditNumber.trim(), selectedFiles) : null;
      const uploadedDocuments = normalizeDocumentsResponse(uploadResponse);
      const documents = uploadedDocuments.length ? uploadedDocuments : uploads;
      const payload = buildAuditPayload(documents);
      const result = await runAudit(auditNumber.trim(), payload);

      if (uploadedDocuments.length) {
        setUploads(uploadedDocuments);
      }
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage({ type: "success", text: "Auditoria ejecutada correctamente." });
      navigate(`/dashboard/cases/${auditNumber.trim()}/result`, { state: { result } });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "No se pudo consultar la informacion. Verifique la conexion con el backend." });
    } finally {
      setIsAuditing(false);
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

      {isLoadingDocuments ? <LoadingState message="Consultando documentos del caso..." /> : null}
      {documentsError ? <ErrorState message={documentsError} /> : null}
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

      <UploadedFilesTable uploads={uploads} />
    </section>
  );
}

function normalizeDocumentsResponse(response) {
  const documents = Array.isArray(response) ? response : response?.documents ?? response?.items ?? [];
  return documents.map(normalizeDocument);
}

function normalizeDocument(document) {
  return {
    id: document.id ?? document.documentId ?? document.name,
    auditNumber: document.auditNumber ?? document.caseId ?? document.case_id ?? "",
    documentType: document.documentType ?? document.type ?? document.document_type ?? "",
    name: document.name ?? document.filename ?? document.fileName ?? "Dato no disponible",
    size: Number(document.size ?? 0),
    type: document.fileType ?? document.extension ?? document.mimeType ?? document.mime_type ?? "",
    mimeType: document.mimeType ?? document.mime_type ?? "",
    uploadedAt: document.uploadedAt ?? document.createdAt ?? document.created_at ?? "",
    status: document.status ?? "cargado",
    extractionStatus: document.extractionStatus ?? document.extraction_status ?? "Dato no disponible"
  };
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

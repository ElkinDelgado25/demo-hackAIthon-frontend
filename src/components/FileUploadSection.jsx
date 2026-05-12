import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runAudit } from "../services/auditService";
import {
  allowedUploadExtensions,
  documentTypeOptions,
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

const documentOptions = documentTypeOptions;

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
  const documentTypes = useMemo(
    () => new Set([
      ...uploads.map((upload) => upload.documentType),
      ...selectedFiles.map((item) => item.documentType)
    ]),
    [selectedFiles, uploads]
  );
  const missingRequiredTypes = useMemo(
    () => requiredDocumentTypes.filter((documentType) => !documentTypes.has(documentType)),
    [documentTypes]
  );
  const isAuditReady = missingRequiredTypes.length === 0 && (uploads.length > 0 || selectedFiles.length > 0);

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

  function handleChangeUploadedDocumentType(uploadId, documentType) {
    setUploads((currentUploads) =>
      currentUploads.map((upload) => (upload.id === uploadId ? { ...upload, documentType } : upload))
    );
    setMessage({ type: "success", text: "Tipo de documento actualizado para esta auditoria." });
  }

  function validateRequiredDocuments() {
    if (missingRequiredTypes.length > 0) {
      return `Faltan documentos obligatorios: ${missingRequiredTypes.join(", ")}.`;
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
      const selectedDocuments = uploadedDocuments.length ? uploadedDocuments : selectedFiles.map((item) => createSelectedDocument(item, auditNumber.trim()));
      const documents = mergeDocuments(uploads, selectedDocuments);
      const payload = buildAuditPayload(documents);
      const result = await runAudit(auditNumber.trim(), payload);

      if (selectedDocuments.length) {
        setUploads(documents);
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
            accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg,.txt"
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

      <DocumentReadinessChecklist documentTypes={documentTypes} isAuditReady={isAuditReady} />

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

      <UploadedFilesTable
        uploads={uploads}
        documentOptions={documentOptions}
        onChangeDocumentType={handleChangeUploadedDocumentType}
      />
    </section>
  );
}

function DocumentReadinessChecklist({ documentTypes, isAuditReady }) {
  return (
    <div className={`audit-checklist ${isAuditReady ? "ready" : ""}`} aria-label="Documentos obligatorios para auditar">
      {requiredDocumentTypes.map((documentType) => {
        const isComplete = documentTypes.has(documentType);

        return (
          <span className={isComplete ? "complete" : "missing"} key={documentType}>
            {documentLabel(documentType)}: {isComplete ? "completo" : "pendiente"}
          </span>
        );
      })}
      <strong>{isAuditReady ? "Listo para auditar" : "Completa o reclasifica los documentos para auditar"}</strong>
    </div>
  );
}

function normalizeDocumentsResponse(response) {
  const documents = Array.isArray(response) ? response : response?.documents ?? response?.items ?? [];
  return documents.map(normalizeDocument);
}

function mergeDocuments(currentDocuments, nextDocuments) {
  const documentsByKey = new Map();

  [...currentDocuments, ...nextDocuments].forEach((document) => {
    documentsByKey.set(document.id ?? `${document.name}-${document.documentType}`, document);
  });

  return Array.from(documentsByKey.values());
}

function createSelectedDocument(item, auditNumber) {
  return {
    id: `${item.file.name}-${item.documentType}-${item.file.lastModified}`,
    auditNumber,
    documentType: item.documentType,
    name: item.file.name,
    size: item.file.size,
    type: item.file.name.split(".").pop()?.toUpperCase() ?? item.file.type,
    mimeType: item.file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    status: "cargado",
    extractionStatus: "pendiente",
    parseStatus: "pendiente",
    parseError: ""
  };
}

function normalizeDocument(document) {
  return {
    id: document.id ?? document.documentId ?? document.name,
    auditNumber: document.auditNumber ?? document.caseId ?? document.case_id ?? "",
    documentType: document.documentType ?? document.document_type ?? document.type ?? "",
    name: document.originalName ?? document.name ?? document.filename ?? document.fileName ?? "Dato no disponible",
    size: Number(document.size ?? 0),
    type: document.extension ?? document.fileType ?? document.mimeType ?? document.mime_type ?? "",
    mimeType: document.mimeType ?? document.mime_type ?? "",
    uploadedAt: document.uploadedAt ?? document.createdAt ?? document.created_at ?? "",
    status: document.status ?? "cargado",
    extractionStatus: document.parseStatus ?? document.extractionStatus ?? document.extraction_status ?? "Dato no disponible",
    parseStatus: document.parseStatus ?? document.extractionStatus ?? document.extraction_status ?? "",
    parseError: document.parseError ?? document.parse_error ?? ""
  };
}

function suggestDocumentType(fileName) {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.includes("factura")) {
    return "FACTURA";
  }

  if (normalizedName.includes("orden") || normalizedName.includes("reparacion")) {
    return "ORDEN_REPARACION";
  }

  if (normalizedName.includes("mano") || normalizedName.includes("obra")) {
    return "DETALLE_MANO_OBRA";
  }

  if (
    normalizedName.includes("foto") ||
    normalizedName.includes("fotos") ||
    normalizedName.includes("danio") ||
    normalizedName.includes("daño") ||
    normalizedName.includes("dano") ||
    normalizedName.endsWith(".png") ||
    normalizedName.endsWith(".jpg") ||
    normalizedName.endsWith(".jpeg")
  ) {
    return "FOTOS_DANIO";
  }

  if (normalizedName.includes("tarifario")) {
    return "TARIFARIO";
  }

  if (normalizedName.includes("poliza") || normalizedName.includes("póliza")) {
    return "POLIZA";
  }

  if (normalizedName.includes("sustento") || normalizedName.includes("adicional")) {
    return "SUSTENTO_ADICIONAL";
  }

  return "FACTURA";
}

function documentLabel(documentType) {
  const labels = {
    FACTURA: "Factura",
    ORDEN_REPARACION: "Orden de reparacion",
    DETALLE_MANO_OBRA: "Detalle mano de obra",
    FOTOS_DANIO: "Fotos del dano",
    TARIFARIO: "Tarifario",
    POLIZA: "Poliza",
    SUSTENTO_ADICIONAL: "Sustento adicional"
  };

  return labels[documentType] ?? documentType;
}

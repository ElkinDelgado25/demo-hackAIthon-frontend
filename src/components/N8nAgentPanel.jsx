import { Bot, ExternalLink, Send, Workflow } from "lucide-react";
import { useState } from "react";
import { n8nConfig } from "../config/n8n";

export function N8nAgentPanel({ auditCase }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Listo para conectar el workflow auditable.");

  async function sendToN8n() {
    if (!n8nConfig.webhookUrl) {
      setStatus("warning");
      setMessage("Configura VITE_N8N_AUDITOR_WEBHOOK_URL en .env.local para enviar casos al workflow.");
      return;
    }

    setStatus("loading");
    setMessage("Enviando caso al workflow de n8n...");

    try {
      const response = await fetch(n8nConfig.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "hackiathon-frontend",
          event: "audit_case_review_requested",
          auditCase
        })
      });

      if (!response.ok) {
        throw new Error(`n8n respondio con estado ${response.status}`);
      }

      setStatus("success");
      setMessage("Caso enviado. El agente puede auditar tarifario, duplicados y evidencias desde n8n.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <section className="agent-panel" aria-label="Agente auditable n8n">
      <div className="section-heading">
        <div>
          <p className="eyebrow">n8n</p>
          <h2>Agente auditable embebido</h2>
        </div>
        <div className="agent-icon">
          <Bot size={20} />
        </div>
      </div>

      <div className="agent-actions">
        <button className="primary-action" onClick={sendToN8n} disabled={status === "loading"}>
          <Send size={17} />
          Enviar caso
        </button>
        {n8nConfig.embedUrl ? (
          <a className="secondary-action" href={n8nConfig.embedUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            Abrir n8n
          </a>
        ) : null}
      </div>

      <div className={`agent-status ${status}`}>
        <Workflow size={18} />
        <span>{message}</span>
      </div>

      {n8nConfig.embedUrl ? (
        <iframe
          className="n8n-frame"
          title="Workflow auditable n8n"
          src={n8nConfig.embedUrl}
          loading="lazy"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      ) : (
        <div className="embed-placeholder">
          <strong>Espacio reservado para n8n</strong>
          <p>Publica un chat, formulario o vista del workflow en n8n y pega la URL en .env.local.</p>
          <code>VITE_N8N_AUDITOR_EMBED_URL=https://...</code>
        </div>
      )}
    </section>
  );
}

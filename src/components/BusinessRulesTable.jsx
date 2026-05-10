import { Edit3, Power, Trash2 } from "lucide-react";
import { EmptyState } from "./States";

export function BusinessRulesTable({ rules, onEdit, onToggle, onDelete }) {
  if (rules.length === 0) {
    return <EmptyState detail="No existen reglas configuradas." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Regla</th>
            <th>Tipo</th>
            <th>Campo</th>
            <th>Operador</th>
            <th>Referencia</th>
            <th>Severidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>
                <strong>{rule.name || "Dato no disponible"}</strong>
                <span>{rule.alertMessage || "Dato no disponible"}</span>
              </td>
              <td>{rule.type || "Dato no disponible"}</td>
              <td>{rule.targetField || "Dato no disponible"}</td>
              <td>{rule.operator || "Dato no disponible"}</td>
              <td>{rule.referenceValue || "Dato no disponible"}</td>
              <td>
                <span className={`severity-pill ${rule.severity?.toLowerCase() ?? ""}`}>{rule.severity || "Dato no disponible"}</span>
              </td>
              <td>
                <span className={`file-status ${rule.status?.toLowerCase() ?? ""}`}>{rule.status || "Dato no disponible"}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => onEdit(rule)} aria-label="Editar regla">
                    <Edit3 size={16} />
                  </button>
                  <button className="icon-button" type="button" onClick={() => onToggle(rule.id)} aria-label="Activar o desactivar regla">
                    <Power size={16} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(rule.id)} aria-label="Eliminar regla">
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

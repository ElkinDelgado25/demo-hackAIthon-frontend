import { Edit3, Power, Trash2 } from "lucide-react";

export function BusinessRulesTable({ rules, onEdit, onToggle, onDelete }) {
  if (rules.length === 0) {
    return (
      <div className="empty-state">
        <strong>No hay reglas con esos filtros</strong>
        <p>Ajusta la busqueda o crea una nueva regla para el motor de auditoria.</p>
      </div>
    );
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
                <strong>{rule.name}</strong>
                <span>{rule.alertMessage}</span>
              </td>
              <td>{rule.type}</td>
              <td>{rule.targetField}</td>
              <td>{rule.operator}</td>
              <td>{rule.referenceValue}</td>
              <td>
                <span className={`severity-pill ${rule.severity.toLowerCase()}`}>{rule.severity}</span>
              </td>
              <td>
                <span className={`file-status ${rule.status.toLowerCase()}`}>{rule.status}</span>
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

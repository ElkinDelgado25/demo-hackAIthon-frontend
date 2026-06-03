import { Edit3, Power, Trash2 } from "lucide-react";
import { formatBusinessRuleLabel } from "../data/businessRules";
import { EmptyState } from "./States";

export function BusinessRulesTable({ rules, onEdit, onToggle, onDelete }) {
  if (rules.length === 0) {
    return <EmptyState detail="No configured rules found." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Type</th>
            <th>Field</th>
            <th>Operator</th>
            <th>Reference</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>
                <strong>{rule.name || "Data unavailable"}</strong>
                <span>{rule.alertMessage || "Data unavailable"}</span>
              </td>
              <td>{formatBusinessRuleLabel(rule.type)}</td>
              <td>{rule.targetField || "Data unavailable"}</td>
              <td>{formatBusinessRuleLabel(rule.operator)}</td>
              <td>{rule.referenceValue || "Data unavailable"}</td>
              <td>
                <span className={`severity-pill ${rule.severity?.toLowerCase() ?? ""}`}>{formatBusinessRuleLabel(rule.severity)}</span>
              </td>
              <td>
                <span className={`file-status ${rule.status?.toLowerCase() ?? ""}`}>{formatBusinessRuleLabel(rule.status)}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => onEdit(rule)} aria-label="Edit rule">
                    <Edit3 size={16} />
                  </button>
                  <button className="icon-button" type="button" onClick={() => onToggle(rule.id)} aria-label="Enable or disable rule">
                    <Power size={16} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(rule.id)} aria-label="Delete rule">
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

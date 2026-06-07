import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatBusinessRuleLabel, ruleOperators, ruleSeverities, ruleStatuses, ruleTypes } from "../data/businessRules";

const emptyForm = {
  name: "",
  description: "",
  type: "PRECIO_MAXIMO",
  targetField: "",
  operator: "MAYOR_QUE",
  referenceValue: "",
  severity: "MEDIA",
  status: "ACTIVA",
  alertMessage: ""
};

export function BusinessRuleForm({ editingRule, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(editingRule ?? emptyForm);
  }, [editingRule]);

  function updateField(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);

    if (!editingRule) {
      setForm(emptyForm);
    }
  }

  return (
    <form className="rule-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{editingRule ? "Edit" : "New rule"}</p>
          <h2>{editingRule ? editingRule.name : "Create business rule"}</h2>
        </div>
        {editingRule ? (
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel edit">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Name
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>

        <label>
          Rule type
          <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
            {ruleTypes.map((type) => (
              <option key={type} value={type}>
                {formatBusinessRuleLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Target field
          <input
            value={form.targetField}
            onChange={(event) => updateField("targetField", event.target.value)}
            placeholder="invoice.items.price"
            required
          />
        </label>

        <label>
          Operator
          <select value={form.operator} onChange={(event) => updateField("operator", event.target.value)}>
            {ruleOperators.map((operator) => (
              <option key={operator} value={operator}>
                {formatBusinessRuleLabel(operator)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reference value
          <input
            value={form.referenceValue}
            onChange={(event) => updateField("referenceValue", event.target.value)}
            placeholder="20, tariff, invoice"
            required
          />
        </label>

        <label>
          Severity
          <select value={form.severity} onChange={(event) => updateField("severity", event.target.value)}>
            {ruleSeverities.map((severity) => (
              <option key={severity} value={severity}>
                {formatBusinessRuleLabel(severity)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            {ruleStatuses.map((status) => (
              <option key={status} value={status}>
                {formatBusinessRuleLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Description
        <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
      </label>

      <label>
        Alert message
        <textarea value={form.alertMessage} onChange={(event) => updateField("alertMessage", event.target.value)} required />
      </label>

      <button className="primary-action" type="submit">
        <Save size={17} />
        {editingRule ? "Save changes" : "Create rule"}
      </button>
    </form>
  );
}

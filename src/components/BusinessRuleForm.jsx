import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ruleOperators, ruleSeverities, ruleStatuses, ruleTypes } from "../data/businessRules";

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
          <p className="eyebrow">{editingRule ? "Editar" : "Nueva regla"}</p>
          <h2>{editingRule ? editingRule.name : "Crear regla de negocio"}</h2>
        </div>
        {editingRule ? (
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancelar edicion">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Nombre
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>

        <label>
          Tipo de regla
          <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
            {ruleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Campo objetivo
          <input
            value={form.targetField}
            onChange={(event) => updateField("targetField", event.target.value)}
            placeholder="invoice.items.price"
            required
          />
        </label>

        <label>
          Operador
          <select value={form.operator} onChange={(event) => updateField("operator", event.target.value)}>
            {ruleOperators.map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </label>

        <label>
          Valor de referencia
          <input
            value={form.referenceValue}
            onChange={(event) => updateField("referenceValue", event.target.value)}
            placeholder="20, tarifario, factura"
            required
          />
        </label>

        <label>
          Severidad
          <select value={form.severity} onChange={(event) => updateField("severity", event.target.value)}>
            {ruleSeverities.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            {ruleStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Descripcion
        <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
      </label>

      <label>
        Mensaje de alerta
        <textarea value={form.alertMessage} onChange={(event) => updateField("alertMessage", event.target.value)} required />
      </label>

      <button className="primary-action" type="submit">
        <Save size={17} />
        {editingRule ? "Guardar cambios" : "Crear regla"}
      </button>
    </form>
  );
}

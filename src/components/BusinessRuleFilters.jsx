import { Search } from "lucide-react";
import { formatBusinessRuleLabel, ruleSeverities, ruleStatuses, ruleTypes } from "../data/businessRules";

export function BusinessRuleFilters({ filters, onChange }) {
  function updateFilter(name, value) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <section className="filters-panel" aria-label="Filtros de reglas">
      <label className="search-box compact">
        <Search size={17} />
        <input
          value={filters.search}
          placeholder="Buscar regla por nombre"
          onChange={(event) => updateFilter("search", event.target.value)}
        />
      </label>

      <SelectFilter label="Tipo" value={filters.type} options={ruleTypes} onChange={(value) => updateFilter("type", value)} />
      <SelectFilter
        label="Severidad"
        value={filters.severity}
        options={ruleSeverities}
        onChange={(value) => updateFilter("severity", value)}
      />
      <SelectFilter
        label="Estado"
        value={filters.status}
        options={ruleStatuses}
        onChange={(value) => updateFilter("status", value)}
      />
    </section>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatBusinessRuleLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

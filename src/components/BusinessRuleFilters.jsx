import { Search } from "lucide-react";
import { formatBusinessRuleLabel, ruleSeverities, ruleStatuses, ruleTypes } from "../data/businessRules";

export function BusinessRuleFilters({ filters, onChange }) {
  function updateFilter(name, value) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <section className="filters-panel" aria-label="Rule filters">
      <label className="search-box compact">
        <Search size={17} />
        <input
          value={filters.search}
          placeholder="Search rule by name"
          onChange={(event) => updateFilter("search", event.target.value)}
        />
      </label>

      <SelectFilter label="Type" value={filters.type} options={ruleTypes} onChange={(value) => updateFilter("type", value)} />
      <SelectFilter
        label="Severity"
        value={filters.severity}
        options={ruleSeverities}
        onChange={(value) => updateFilter("severity", value)}
      />
      <SelectFilter
        label="Status"
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
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatBusinessRuleLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

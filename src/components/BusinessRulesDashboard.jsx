import { useEffect, useMemo, useState } from "react";
import { BusinessRuleFilters } from "./BusinessRuleFilters";
import { BusinessRuleForm } from "./BusinessRuleForm";
import { BusinessRulesTable } from "./BusinessRulesTable";
import { RuleStatsCards } from "./RuleStatsCards";
import {
  createBusinessRule,
  deleteBusinessRule,
  getBusinessRules,
  toggleBusinessRule,
  updateBusinessRule
} from "../services/businessRuleService";

const defaultFilters = {
  search: "",
  type: "",
  severity: "",
  status: ""
};

export function BusinessRulesDashboard() {
  const [rules, setRules] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [editingRule, setEditingRule] = useState(null);
  const [message, setMessage] = useState({ type: "info", text: "Administra las reglas que usara el auditor." });

  useEffect(() => {
    getBusinessRules().then(setRules);
  }, []);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = rule.name.toLowerCase().includes(filters.search.toLowerCase().trim());
      const matchesType = !filters.type || rule.type === filters.type;
      const matchesSeverity = !filters.severity || rule.severity === filters.severity;
      const matchesStatus = !filters.status || rule.status === filters.status;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [filters, rules]);

  async function handleSubmit(payload) {
    if (editingRule) {
      const updatedRule = await updateBusinessRule(editingRule.id, payload);
      setRules((currentRules) => currentRules.map((rule) => (rule.id === editingRule.id ? updatedRule : rule)));
      setEditingRule(null);
      setMessage({ type: "success", text: "Regla actualizada correctamente." });
      return;
    }

    const createdRule = await createBusinessRule(payload);
    setRules((currentRules) => [createdRule, ...currentRules]);
    setMessage({ type: "success", text: "Regla creada correctamente." });
  }

  async function handleToggle(id) {
    const updatedRule = await toggleBusinessRule(id);
    setRules((currentRules) => currentRules.map((rule) => (rule.id === id ? updatedRule : rule)));
    setMessage({ type: "success", text: `Regla ${updatedRule.status.toLowerCase()} correctamente.` });
  }

  async function handleDelete(id) {
    await deleteBusinessRule(id);
    setRules((currentRules) => currentRules.filter((rule) => rule.id !== id));
    if (editingRule?.id === id) {
      setEditingRule(null);
    }
    setMessage({ type: "success", text: "Regla eliminada correctamente." });
  }

  return (
    <section className="rules-dashboard">
      <RuleStatsCards rules={rules} />

      <div className="rules-layout">
        <BusinessRuleForm editingRule={editingRule} onSubmit={handleSubmit} onCancel={() => setEditingRule(null)} />

        <div className="rules-table-panel">
          <BusinessRuleFilters filters={filters} onChange={setFilters} />
          <div className={`form-message ${message.type}`}>{message.text}</div>
          <BusinessRulesTable
            rules={filteredRules}
            onEdit={setEditingRule}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </section>
  );
}

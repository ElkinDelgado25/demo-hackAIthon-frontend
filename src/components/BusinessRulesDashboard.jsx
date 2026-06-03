import { useEffect, useMemo, useState } from "react";
import { BusinessRuleFilters } from "./BusinessRuleFilters";
import { BusinessRuleForm } from "./BusinessRuleForm";
import { BusinessRulesTable } from "./BusinessRulesTable";
import { RuleStatsCards } from "./RuleStatsCards";
import { ErrorState, LoadingState } from "./States";
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
  const [message, setMessage] = useState({ type: "info", text: "Manage the rules used by the auditor." });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    setIsLoading(true);
    try {
      const data = await getBusinessRules();
      setRules(data);
      setError("");
    } catch {
      setError("Could not load data. Check backend connectivity.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = (rule.name ?? "").toLowerCase().includes(filters.search.toLowerCase().trim());
      const matchesType = !filters.type || rule.type === filters.type;
      const matchesSeverity = !filters.severity || rule.severity === filters.severity;
      const matchesStatus = !filters.status || rule.status === filters.status;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [filters, rules]);

  async function handleSubmit(payload) {
    try {
      if (editingRule) {
        await updateBusinessRule(editingRule.id, payload);
        await loadRules();
        setEditingRule(null);
        setMessage({ type: "success", text: "Rule updated successfully." });
        return;
      }

      await createBusinessRule(payload);
      await loadRules();
      setMessage({ type: "success", text: "Rule created successfully." });
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    }
  }

  async function handleToggle(id) {
    try {
      await toggleBusinessRule(id);
      await loadRules();
      setMessage({ type: "success", text: "Rule status updated successfully." });
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteBusinessRule(id);
      await loadRules();
      if (editingRule?.id === id) {
        setEditingRule(null);
      }
      setMessage({ type: "success", text: "Rule deleted successfully." });
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    }
  }

  return (
    <section className="rules-dashboard">
      <RuleStatsCards rules={rules} />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

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

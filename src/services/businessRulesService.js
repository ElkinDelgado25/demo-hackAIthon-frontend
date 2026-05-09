import { initialBusinessRules } from "../data/businessRules";

const STORAGE_KEY = "hackiathon.businessRules";

export const businessRulesEndpoints = {
  list: "GET /business-rules",
  create: "POST /business-rules",
  update: "PUT /business-rules/{id}",
  toggle: "PATCH /business-rules/{id}/toggle",
  remove: "DELETE /business-rules/{id}"
};

function readRules() {
  const storedRules = localStorage.getItem(STORAGE_KEY);

  if (!storedRules) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBusinessRules));
    return initialBusinessRules;
  }

  try {
    return JSON.parse(storedRules);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBusinessRules));
    return initialBusinessRules;
  }
}

function writeRules(rules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  return rules;
}

export async function getBusinessRules() {
  return readRules();
}

export async function createBusinessRule(payload) {
  const rules = readRules();
  const nextRule = {
    ...payload,
    id: `rule-${Date.now()}`
  };

  writeRules([nextRule, ...rules]);
  return nextRule;
}

export async function updateBusinessRule(id, payload) {
  const rules = readRules();
  const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, ...payload, id } : rule));
  writeRules(updatedRules);
  return updatedRules.find((rule) => rule.id === id);
}

export async function toggleBusinessRule(id) {
  const rules = readRules();
  const updatedRules = rules.map((rule) =>
    rule.id === id ? { ...rule, status: rule.status === "ACTIVA" ? "INACTIVA" : "ACTIVA" } : rule
  );
  writeRules(updatedRules);
  return updatedRules.find((rule) => rule.id === id);
}

export async function deleteBusinessRule(id) {
  const rules = readRules();
  writeRules(rules.filter((rule) => rule.id !== id));
  return { id };
}

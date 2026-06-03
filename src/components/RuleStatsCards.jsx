import { StatCard } from "./States";

export function RuleStatsCards({ rules }) {
  if (rules.length === 0) {
    return (
      <section className="metrics" aria-label="Rule summary">
        <StatCard label="Total rules" value={null} />
        <StatCard label="Active" value={null} />
        <StatCard label="Inactive" value={null} />
        <StatCard label="Critical" value={null} />
      </section>
    );
  }

  const total = rules.length;
  const active = rules.filter((rule) => rule.status === "ACTIVA").length;
  const inactive = rules.filter((rule) => rule.status === "INACTIVA").length;
  const critical = rules.filter((rule) => rule.severity === "CRITICA").length;

  return (
    <section className="metrics" aria-label="Rule summary">
      <StatCard label="Total rules" value={total} />
      <StatCard label="Active" value={active} />
      <StatCard label="Inactive" value={inactive} />
      <StatCard label="Critical" value={critical} />
    </section>
  );
}

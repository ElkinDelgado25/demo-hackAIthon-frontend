export function LoadingState({ message = "Loading data..." }) {
  return <div className="form-message info">{message}</div>;
}

export function ErrorState({ message = "Could not load data. Check backend connectivity." }) {
  return <div className="form-message error">{message}</div>;
}

export function EmptyState({ message = "Data unavailable", detail }) {
  return (
    <div className="empty-state">
      <strong>{message}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

export function StatCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{isAvailable(value) ? value : "Data unavailable"}</strong>
    </div>
  );
}

export function DenialReasonsCard({ reasons }) {
  const topReasons = Array.isArray(reasons) ? reasons.slice(0, 3) : [];

  return (
    <section className="route-panel">
      <div className="section-heading">
        <h2>Top denial reasons</h2>
      </div>
      {topReasons.length === 0 ? (
        <EmptyState detail="No denial reasons registered." />
      ) : (
        <div className="denial-reasons">
          {topReasons.map((item) => (
            <div className="finding" key={item.reason}>
              <div>
                <strong>{item.reason || "Data unavailable"}</strong>
                <p>{isAvailable(item.count) ? `${item.count} case(s)` : "Data unavailable"}</p>
              </div>
              <span>{isAvailable(item.percentage) ? `${item.percentage}%` : "Data unavailable"}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function isAvailable(value) {
  return value !== null && value !== undefined && value !== "";
}

export function LoadingState({ message = "Cargando datos..." }) {
  return <div className="form-message info">{message}</div>;
}

export function ErrorState({ message = "No se pudieron cargar los datos. Revisa la conexion con el backend." }) {
  return <div className="form-message error">{message}</div>;
}

export function EmptyState({ message = "Dato no disponible", detail }) {
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
      <strong>{isAvailable(value) ? value : "Dato no disponible"}</strong>
    </div>
  );
}

export function DenialReasonsCard({ reasons }) {
  const topReasons = Array.isArray(reasons) ? reasons.slice(0, 3) : [];

  return (
    <section className="route-panel">
      <div className="section-heading">
        <h2>Principales motivos de rechazo</h2>
      </div>
      {topReasons.length === 0 ? (
        <EmptyState detail="No hay motivos de rechazo registrados." />
      ) : (
        <div className="denial-reasons">
          {topReasons.map((item) => (
            <div className="finding" key={item.reason}>
              <div>
                <strong>{item.reason || "Dato no disponible"}</strong>
                <p>{isAvailable(item.count) ? `${item.count} caso(s)` : "Dato no disponible"}</p>
              </div>
              <span>{isAvailable(item.percentage) ? `${item.percentage}%` : "Dato no disponible"}</span>
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

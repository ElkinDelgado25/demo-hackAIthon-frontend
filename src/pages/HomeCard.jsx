export function HomeCard({ title, description, icon: Icon }) {
  return (
    <div className="home-card">
      {Icon ? (
        <div className="card-icon">
          <Icon size={28} />
        </div>
      ) : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

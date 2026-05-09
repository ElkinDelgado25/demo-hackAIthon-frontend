import { ClipboardCheck, FileSearch, Filter, Gauge, ShieldCheck, UploadCloud } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <span className="nav-logo-mark">
            <ClipboardCheck size={20} />
          </span>
          AuditIA
        </NavLink>

        <div className="nav-menu" aria-label="Vistas de auditoria">
          <NavbarLink to="/" icon={Gauge} label="Panel" end />
          <NavbarLink to="/casos" icon={FileSearch} label="Casos" />
          <NavbarLink to="/archivos" icon={UploadCloud} label="Archivos" />
          <NavbarLink to="/reglas" icon={Filter} label="Reglas" />
          <NavbarLink to="/agente" icon={ShieldCheck} label="Agente" />
        </div>
      </div>
    </nav>
  );
}

function NavbarLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

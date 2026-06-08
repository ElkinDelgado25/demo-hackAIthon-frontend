import { ClipboardCheck, Home, PlayCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <span className="brand-mark">
            <ClipboardCheck size={20} />
          </span>
          Agente asegurados de therians
        </NavLink>

        <div className="nav-menu" aria-label="Navegacion principal">
          <NavbarLink to="/" icon={Home} label="Overview" end />
          <NavbarLink to="/dashboard" icon={PlayCircle} label="Open workspace" />
          <NavbarLink to="/dashboard/cases" icon={ClipboardCheck} label="Cases" />
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

import { ClipboardCheck, FileSearch, Filter, Gauge, History, Home, UploadCloud } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/" className="dashboard-brand">
          <span className="dashboard-brand-mark">
            <ClipboardCheck size={20} />
          </span>
          <span>
            <strong>SecureMAX</strong>
            <small>Centro de control SaaS</small>
          </span>
        </NavLink>

        <nav className="dashboard-nav" aria-label="Navegacion del panel">
          <SidebarLink to="/" icon={Home} label="Inicio" end />
          <SidebarLink to="/dashboard" icon={Gauge} label="Resumen" end />
          <SidebarLink to="/dashboard/cases" icon={FileSearch} label="Casos" />
          <SidebarLink to="/dashboard/files" icon={UploadCloud} label="Documentos" />
          <SidebarLink to="/dashboard/rules" icon={Filter} label="Reglas" />
          <SidebarLink to="/dashboard/history" icon={History} label="Historial" />
        </nav>
      </aside>

      <section className="dashboard-content">
        <Outlet />
      </section>
    </main>
  );
}

function SidebarLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

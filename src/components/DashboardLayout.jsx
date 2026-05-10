import { ClipboardCheck, FileSearch, Filter, Gauge, History, ShieldCheck, UploadCloud } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/dashboard" end className="dashboard-brand">
          <span className="dashboard-brand-mark">
            <ClipboardCheck size={20} />
          </span>
          <span>
            <strong>AuditIA</strong>
            <small>Auditoria interna</small>
          </span>
        </NavLink>

        <nav className="dashboard-nav" aria-label="Navegacion del dashboard">
          <SidebarLink to="/dashboard" icon={Gauge} label="Inicio" end />
          <SidebarLink to="/dashboard/cases" icon={FileSearch} label="Casos" />
          <SidebarLink to="/dashboard/files" icon={UploadCloud} label="Archivos" />
          <SidebarLink to="/dashboard/rules" icon={Filter} label="Reglas" />
          <SidebarLink to="/dashboard/history" icon={History} label="Historial" />
          <SidebarLink to="/dashboard/agent" icon={ShieldCheck} label="Agente" />
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

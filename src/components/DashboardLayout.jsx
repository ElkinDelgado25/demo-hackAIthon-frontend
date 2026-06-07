import { ClipboardCheck, FileSearch, Filter, Gauge, History, UploadCloud } from "lucide-react";
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
            <strong>Agentic Auditor</strong>
            <small>SaaS control center</small>
          </span>
        </NavLink>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <SidebarLink to="/dashboard" icon={Gauge} label="Overview" end />
          <SidebarLink to="/dashboard/cases" icon={FileSearch} label="Cases" />
          <SidebarLink to="/dashboard/files" icon={UploadCloud} label="Documents" />
          <SidebarLink to="/dashboard/rules" icon={Filter} label="Rules" />
          <SidebarLink to="/dashboard/history" icon={History} label="History" />
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

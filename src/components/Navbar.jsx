import React from 'react'
import { Home, FileText, Lock, Shield } from 'lucide-react'

export function Navbar() {
  return (
    <>
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-left">
                  <div className="brand-mark"><Shield size={20} /></div>
                  <h2 className="nav-logo">AuditIA</h2>
                </div>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <a href="/" className="nav-link nav-icon-link"><Home size={18} /> Inicio</a>
                    </li>
                    <li className="nav-item">
                        <a href="/cases" className="nav-link nav-icon-link"><FileText size={18} /> Acerca de </a>
                    </li>
                    <li className="nav-item">
                        <a href="/files" className="nav-link nav-icon-link"><FileText size={18} /> Contacto</a>
                    </li>
                </ul>
            </div>
        </nav>
    </>
  )
}

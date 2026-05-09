import React from 'react'

export function Navbar() {
  return (
    <>
        <nav className="navbar">
            <div className="nav-container">
                <h2 className="nav-logo">AuditIA</h2>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <a href="/" className="nav-link">Home</a>
                    </li>
                    <li className="nav-item">
                        <a href="/about" className="nav-link">About</a>
                    </li>
                    <li className="nav-item">
                        <a href="/contact" className="nav-link">Contact</a>
                    </li>
                </ul>
            </div>
        </nav>
    </>
  )
}

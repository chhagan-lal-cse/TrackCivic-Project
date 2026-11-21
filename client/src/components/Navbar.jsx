import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/report', label: 'Report Issue' },
  { to: '/track', label: 'Track Complaint' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, homePath } = useAuth();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <nav className="navbar navbar-expand-lg cf-navbar py-2 sticky-top" aria-label="Main navigation">
      <div className="container">
        <Logo />
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="cf-main-nav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'} fs-4`} />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="cf-main-nav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            {LINKS.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink to={l.to} end={l.end} className="nav-link px-3">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-wrap align-items-center gap-2 pb-2 pb-lg-0">
            {user ? (
              <>
                <span className={`tc-user-chip ${user.role === 'admin' ? 'admin' : 'citizen'}`}>
                  <i className={`bi ${user.role === 'admin' ? 'bi-shield-check' : 'bi-person-check'} me-1`} />
                  <span className="fw-semibold">{user.name?.split(' ')[0]}</span>
                  <small className="opacity-75 ms-1">({user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'Citizen'})</small>
                </span>
                <NavLink to={homePath} className="btn btn-teal btn-sm shadow-sm">
                  <i className="bi bi-speedometer2 me-1" />Dashboard
                </NavLink>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={logout} title="Sign out">
                  <i className="bi bi-box-arrow-right me-1" />Log out
                </button>
              </>
            ) : (
              <>
                {/* Citizen Login Button - Distinct Emerald/Teal */}
                <NavLink
                  to="/login/citizen"
                  className="btn btn-citizen-nav btn-sm shadow-sm"
                  title="Citizen / Resident Portal Login"
                >
                  <i className="bi bi-person-fill me-1" />
                  <span>Citizen Login</span>
                </NavLink>

                {/* Administrator Login Button - Distinct Royal Navy/Indigo */}
                <NavLink
                  to="/login/admin"
                  className="btn btn-admin-nav btn-sm shadow-sm"
                  title="Municipal Administrator Portal Login"
                >
                  <i className="bi bi-shield-lock-fill me-1" />
                  <span>Admin Login</span>
                </NavLink>

                {/* Register Button */}
                <NavLink
                  to="/register"
                  className="btn btn-register-nav btn-sm"
                  title="Register new citizen account"
                >
                  <i className="bi bi-person-plus me-1" />
                  <span>Register</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CITIZEN_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: 'bi-grid', end: true },
  { to: '/dashboard/complaints', label: 'Complaint history', icon: 'bi-layers', end: true },
  { to: '/dashboard/complaints/new', label: 'Submit report', icon: 'bi-plus-square' },
  { to: '/dashboard/profile', label: 'Account settings', icon: 'bi-sliders' },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Command overview', icon: 'bi-grid', end: true },
  { to: '/admin/complaints', label: 'Complaint queue', icon: 'bi-list-task' },
  { to: '/admin/users', label: 'Citizen accounts', icon: 'bi-person-lines-fill' },
  { to: '/admin/departments', label: 'Departments', icon: 'bi-diagram-3' },
  { to: '/admin/profile', label: 'Account settings', icon: 'bi-sliders' },
];

const STAFF_LINKS = [
  { to: '/staff', label: 'Assigned tasks', icon: 'bi-list-task', end: true },
  { to: '/staff/profile', label: 'Account settings', icon: 'bi-sliders' },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const links = isAdmin ? ADMIN_LINKS : isStaff ? STAFF_LINKS : CITIZEN_LINKS;

  return (
    <>
      {open && <div className="cf-sidebar-backdrop open" onClick={onClose} aria-hidden="true" />}
      <aside className={`cf-sidebar p-3 ${open ? 'open' : ''}`} aria-label="Dashboard navigation">
        <div className="d-flex align-items-center justify-content-between mb-4 px-1">
          <Logo />
          <button type="button" className="btn btn-sm text-white d-lg-none" onClick={onClose} aria-label="Close menu">
            <i className="bi bi-x-lg fs-5" />
          </button>
        </div>
        <nav className="nav flex-column gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link" onClick={onClose}>
              <i className={`bi ${l.icon}`} aria-hidden="true" />{l.label}
            </NavLink>
          ))}
          <NavLink to="/" className="nav-link" onClick={onClose}>
            <i className="bi bi-house" aria-hidden="true" />Public site
          </NavLink>
        </nav>
        <div className="mt-auto pt-3 border-top border-secondary">
          <div className="px-1 mb-2">
            <div className="fw-semibold text-truncate">{user?.name}</div>
            <div className="cf-sidebar-role">{isAdmin ? 'Administrator' : isStaff ? 'Field staff' : 'Citizen'}</div>
          </div>
          <button type="button" className="btn btn-outline-light btn-sm w-100" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1" />Log out
          </button>
        </div>
      </aside>
    </>
  );
}

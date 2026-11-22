import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { EMAIL_RE } from '../../utils/validation.js';

export default function RoleLoginPage({ role = 'admin' }) {
  const admin = role === 'admin';
  useDocumentTitle(admin ? 'Administrator Log In — TrackCivic' : 'Field Staff Log In — TrackCivic');
  const { login, logout, user, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const change = (key) => (event) => {
    setValues((v) => ({ ...v, [key]: event.target.value }));
    setErrors((v) => ({ ...v, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!EMAIL_RE.test(values.email.trim())) found.email = 'Enter a valid work email address';
    if (!values.password) found.password = 'Enter your password';
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const u = await login({ email: values.email.trim(), password: values.password }, role);
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      navigate(admin ? '/admin' : '/staff', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tc-auth-page">
      <section className="tc-auth-panel">
        <div className="tc-auth-card">
          <div className="text-center mb-4">
            <Link to="/" className="tc-logo-badge" title="TrackCivic Home">
              <img src="/trackcivic-logo.png" alt="TrackCivic" className="tc-login-logo" />
            </Link>
          </div>

          {/* Role Switcher Tabs */}
          <div className="tc-role-switcher mb-4">
            <NavLink to="/login/citizen" className="tc-role-tab citizen">
              <i className="bi bi-person-fill me-1" />
              Citizen Login
            </NavLink>
            <NavLink to="/login/admin" className={`tc-role-tab admin ${admin ? 'active' : ''}`}>
              <i className="bi bi-shield-lock-fill me-1" />
              Admin Login
            </NavLink>
            <NavLink to="/login/staff" className={`tc-role-tab staff ${!admin ? 'active' : ''}`}>
              <i className="bi bi-tools me-1" />
              Staff Login
            </NavLink>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className={`badge ${admin ? 'tc-badge-pill-indigo' : 'tc-badge-pill-amber'}`}>
              <i className={`bi ${admin ? 'bi-shield-lock-fill' : 'bi-tools'} me-1`} />
              {admin ? 'Administrator Access' : 'Operations Staff'}
            </span>
          </div>

          <h1 className="h3 fw-bold mb-1">{admin ? 'Admin Sign In' : 'Field Staff Sign In'}</h1>
          <p className="text-muted mb-4">
            {admin
              ? 'Manage complaints, allocate departments and oversee civic operations.'
              : 'Open assigned tasks, log repair status and record field progress.'}
          </p>

          <ErrorMessage
            message={
              formError ||
              (location.state?.wrongRole
                ? 'Your previous session was signed out. Sign in with an authorized account to continue.'
                : '')
            }
          />

          <form onSubmit={submit} noValidate className="d-grid gap-3">
            <FormInput
              id={`${role}-email`}
              type="email"
              label="Work email address"
              autoComplete="email"
              placeholder={admin ? 'admin@trackcivic.local' : 'staff@trackcivic.local'}
              required
              value={values.email}
              onChange={change('email')}
              error={errors.email}
            />

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor={`${role}-password`} className="form-label mb-0">
                  Password <span className="text-danger">*</span>
                </label>
                <Link to="/forgot-password" className="small text-decoration-none fw-semibold text-primary">
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <input
                  id={`${role}-password`}
                  type={show ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  autoComplete="current-password"
                  placeholder="Enter your administrative password"
                  value={values.password}
                  onChange={change('password')}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShow((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${show ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <button
              type="submit"
              className={`btn ${admin ? 'btn-admin-card' : 'btn-warning text-dark'} btn-lg w-100 shadow-sm mt-1`}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Verifying credentials…
                </>
              ) : (
                <>
                  {admin ? 'Enter Administrator Workspace' : 'Enter Field Staff Workspace'}
                  <i className="bi bi-arrow-right ms-2" />
                </>
              )}
            </button>
          </form>

          <div className="tc-auth-switch pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
            <Link className="small fw-semibold text-muted" to="/login/citizen">
              <i className="bi bi-arrow-left me-1" />
              Citizen login
            </Link>
            <Link className="small text-muted" to="/">
              Public website
            </Link>
          </div>
        </div>
      </section>

      <aside className="tc-auth-aside">
        <div className="tc-auth-aside-content">
          <span className={`tc-aside-pill ${admin ? 'admin' : 'staff'}`}>
            <i className={`bi ${admin ? 'bi-shield-check' : 'bi-cone-striped'} me-1`} />
            {admin ? 'Civic Administration' : 'Field Operations'}
          </span>
          <h2>{admin ? 'Control with Clarity & Speed.' : 'Execute Every Assignment.'}</h2>
          <p>
            {admin
              ? 'Authorized administrator portal for reviewing citizen issues, routing to field departments, and maintaining city infrastructure standards.'
              : 'Direct field operations portal for tracking assigned tasks, conducting inspections, and recording photo-verified resolutions.'}
          </p>
          <div className="tc-aside-bullets mt-4">
            <div><i className="bi bi-shield-lock-fill text-indigo me-2" />Role-based access control & session auditing</div>
            <div><i className="bi bi-diagram-3-fill text-info me-2" />Cross-department ticket routing & reassignment</div>
            <div><i className="bi bi-graph-up-arrow text-success me-2" />Real-time SLA tracking and ward KPIs</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

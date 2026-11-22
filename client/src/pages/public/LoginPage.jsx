import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { EMAIL_RE } from '../../utils/validation.js';

export default function LoginPage() {
  useDocumentTitle('Citizen Log In — TrackCivic');
  const { login, logout, user, loading, homePath } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={homePath} replace />;

  const set = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!EMAIL_RE.test(values.email.trim())) found.email = 'Enter a valid email address';
    if (!values.password) found.password = 'Enter your password';
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const authenticated = await login({ email: values.email.trim(), password: values.password }, 'citizen');
      if (authenticated.role !== 'citizen') {
        toast.warning('Use the dedicated administrator or field staff portal.');
        await logout(false);
        return;
      }
      toast.success(`Welcome back, ${authenticated.name.split(' ')[0]}`);
      const target = from && !from.startsWith('/admin') ? from : '/dashboard';
      navigate(target === '/report' ? '/dashboard/complaints/new' : target, { replace: true });
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
            <NavLink to="/login/citizen" className="tc-role-tab active citizen">
              <i className="bi bi-person-fill me-1" />
              Citizen Login
            </NavLink>
            <NavLink to="/login/admin" className="tc-role-tab admin">
              <i className="bi bi-shield-lock-fill me-1" />
              Admin Login
            </NavLink>
            <NavLink to="/login/staff" className="tc-role-tab staff">
              <i className="bi bi-tools me-1" />
              Staff Login
            </NavLink>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge tc-badge-pill-teal">
              <i className="bi bi-person-circle me-1" /> Citizen Access
            </span>
          </div>

          <h1 className="h3 fw-bold mb-1">Citizen Sign In</h1>
          <p className="text-muted mb-4">
            Sign in to submit new civic complaints and follow resolution updates.
          </p>

          {location.state?.wrongRole && (
            <div className="alert alert-warning small py-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill me-1" />
              Your previous session was signed out. Sign in with a citizen account to continue.
            </div>
          )}
          {from && (
            <div className="alert alert-light border small py-2 mb-3">
              <i className="bi bi-info-circle me-1" />
              Sign in to continue to the requested page.
            </div>
          )}

          <ErrorMessage message={formError} />

          <form onSubmit={submit} noValidate className="d-grid gap-3">
            <FormInput
              id="citizen-email"
              type="email"
              label="Email address"
              autoComplete="email"
              placeholder="e.g. name@example.com"
              required
              value={values.email}
              onChange={set('email')}
              error={errors.email}
            />

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="citizen-password" className="form-label mb-0">
                  Password <span className="text-danger">*</span>
                </label>
                <Link to="/forgot-password" className="small text-teal text-decoration-none fw-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <input
                  id="citizen-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  autoComplete="current-password"
                  placeholder="Enter your account password"
                  value={values.password}
                  onChange={set('password')}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-citizen-card btn-lg w-100 shadow-sm mt-1" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In to Citizen Portal
                  <i className="bi bi-arrow-right ms-2" />
                </>
              )}
            </button>
          </form>

          <div className="tc-auth-switch pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
            <span className="small text-muted">Don't have an account?</span>
            <Link className="small fw-bold text-teal" to="/register" state={{ from }}>
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      <aside className="tc-auth-aside">
        <div className="tc-auth-aside-content">
          <span className="tc-aside-pill citizen">
            <i className="bi bi-chat-left-heart me-1" /> Citizen Issue Portal
          </span>
          <h2>Every Report Stays Visible.</h2>
          <p>
            Receive a permanent reference number, monitor civic response milestones, and see your community improve step by step.
          </p>
          <div className="tc-aside-bullets mt-4">
            <div><i className="bi bi-shield-check text-success me-2" />End-to-end encrypted citizen accounts</div>
            <div><i className="bi bi-camera-fill text-info me-2" />Attach photos directly from your phone or camera</div>
            <div><i className="bi bi-bell-fill text-warning me-2" />Instant updates when your complaint status changes</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

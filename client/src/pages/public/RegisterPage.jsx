import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import PasswordStrength from '../../components/PasswordStrength.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { EMAIL_RE, PASSWORD_RE, PHONE_RE } from '../../utils/validation.js';

export default function RegisterPage() {
  useDocumentTitle('Create Citizen Account — TrackCivic');
  const { register, user, loading, homePath } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from;

  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={homePath} replace />;

  const set = (key) => (event) => {
    setValues((v) => ({ ...v, [key]: event.target.value }));
    setErrors((v) => ({ ...v, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (values.name.trim().length < 2) e.name = 'Enter your full name';
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Enter a valid email address';
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!PASSWORD_RE.test(values.password)) e.password = 'Use 8–72 characters with upper-case, lower-case and a number';
    if (values.confirmPassword !== values.password) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      toast.success('Account created! Welcome to TrackCivic.');
      navigate(from === '/' ? '/dashboard' : (from || '/dashboard'), { replace: true });
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
        <div className="tc-auth-card" style={{ width: 'min(520px, 100%)' }}>
          <div className="text-center mb-4">
            <Link to="/" className="tc-logo-badge" title="TrackCivic Home">
              <img src="/trackcivic-logo.png" alt="TrackCivic" className="tc-login-logo" />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge tc-badge-pill-teal">
              <i className="bi bi-person-plus-fill me-1" /> Citizen Registration
            </span>
          </div>

          <h1 className="h3 fw-bold mb-1">Create Citizen Account</h1>
          <p className="text-muted mb-4">
            Join thousands of residents keeping our community clean, safe, and transparent.
          </p>

          <ErrorMessage message={formError} />

          <form onSubmit={submit} noValidate className="row g-3">
            <FormInput
              className="col-12"
              id="register-name"
              label="Full Name"
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              required
              value={values.name}
              onChange={set('name')}
              error={errors.name}
              maxLength={80}
            />

            <FormInput
              className="col-md-7"
              id="register-email"
              type="email"
              label="Email Address"
              autoComplete="email"
              placeholder="name@example.com"
              required
              value={values.email}
              onChange={set('email')}
              error={errors.email}
            />

            <FormInput
              className="col-md-5"
              id="register-phone"
              type="tel"
              label="Phone (optional)"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={set('phone')}
              error={errors.phone}
            />

            <div className="col-12">
              <FormInput
                id="register-password"
                type="password"
                label="Password"
                autoComplete="new-password"
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                required
                value={values.password}
                onChange={set('password')}
                error={errors.password}
              />
              <PasswordStrength password={values.password} />
            </div>

            <FormInput
              className="col-12"
              id="register-confirm"
              type="password"
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Repeat password"
              required
              value={values.confirmPassword}
              onChange={set('confirmPassword')}
              error={errors.confirmPassword}
            />

            <div className="col-12 d-grid mt-2">
              <button type="submit" className="btn btn-citizen-card btn-lg shadow-sm" disabled={busy}>
                {busy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Citizen Account
                    <i className="bi bi-arrow-right ms-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="tc-auth-switch pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
            <span className="small text-muted">Already registered?</span>
            <div className="d-flex gap-3">
              <Link className="small fw-bold text-teal" to="/login/citizen" state={{ from }}>
                Citizen Login
              </Link>
              <span className="text-muted small">•</span>
              <Link className="small fw-bold text-indigo" to="/login/admin">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <aside className="tc-auth-aside">
        <div className="tc-auth-aside-content">
          <span className="tc-aside-pill citizen">
            <i className="bi bi-shield-check me-1" /> Verified Public Platform
          </span>
          <h2>Every Voice Counts. Every Issue Moves.</h2>
          <p>
            Log local civic problems directly to responsible departments. Receive automated status notifications and photo-verified closure reports.
          </p>
          <div className="tc-aside-bullets mt-4">
            <div><i className="bi bi-geo-alt-fill text-danger me-2" />Location-based ward issue assignment</div>
            <div><i className="bi bi-images text-info me-2" />Upload multiple evidence photos and notes</div>
            <div><i className="bi bi-chat-dots-fill text-success me-2" />Direct communication with municipal teams</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

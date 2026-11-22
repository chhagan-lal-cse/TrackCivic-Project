import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import api, { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { EMAIL_RE } from '../../utils/validation.js';

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset Password — TrackCivic');
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request code, 2 = enter code & new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 1: Request Verification Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setFieldErrors({});
    setError('');
    setBusy(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      const returnedCode = res.data?.data?.code || '';
      setGeneratedCode(returnedCode);
      if (returnedCode) setCode(returnedCode); // Auto-populate for user convenience
      toast.success('Verification code generated successfully!');
      setStep(2);
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err, 'Could not request password reset code.'));
    } finally {
      setBusy(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const found = {};
    if (!code.trim()) found.code = 'Verification code is required';
    if (!newPassword) found.newPassword = 'New password is required';
    if (newPassword && newPassword.length < 8) found.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) found.confirmPassword = 'Passwords do not match';

    setFieldErrors(found);
    setError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      toast.success('Password updated successfully! You can now log in.');
      navigate('/login/citizen', { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tc-auth-page">
      <section className="tc-auth-panel">
        <div className="tc-auth-card" style={{ width: 'min(480px, 100%)' }}>
          {/* Logo Badge */}
          <div className="text-center mb-3">
            <Link to="/" className="tc-logo-badge" title="TrackCivic Home">
              <img src="/trackcivic-logo.png" alt="TrackCivic" className="tc-login-logo" />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge tc-badge-pill-teal">
              <i className="bi bi-key-fill me-1" /> Account Recovery
            </span>
          </div>

          <h1 className="h3 fw-bold mb-1">Reset Password</h1>
          <p className="text-muted mb-4 small">
            {step === 1
              ? 'Enter your registered email address to receive a secure password reset code.'
              : 'Enter the verification code and set a new password for your account.'}
          </p>

          <ErrorMessage message={error} />

          {step === 1 ? (
            /* Step 1: Request Reset Code */
            <form onSubmit={handleRequestCode} noValidate className="d-grid gap-3">
              <FormInput
                id="reset-email"
                type="email"
                label="Registered Email Address"
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors({});
                }}
                error={fieldErrors.email}
                required
                autoComplete="email"
              />

              <button
                type="submit"
                className="btn btn-teal btn-lg w-100 shadow-sm mt-1"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Sending Code…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2" />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Enter Code & New Password */
            <form onSubmit={handleResetPassword} noValidate className="d-grid gap-3">
              {generatedCode && (
                <div className="p-3 bg-light rounded-3 border small">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted d-block">Your Verification Code:</span>
                      <strong className="fs-5 text-teal letter-spacing-1">{generatedCode}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-teal"
                      onClick={() => setCode(generatedCode)}
                    >
                      <i className="bi bi-clipboard-check me-1" />
                      Auto-fill
                    </button>
                  </div>
                </div>
              )}

              <FormInput
                id="reset-code"
                type="text"
                label="6-Digit Verification Code *"
                placeholder="e.g. 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={fieldErrors.code}
                maxLength={6}
                required
              />

              <div>
                <label htmlFor="new-password" className="form-label mb-1">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  {fieldErrors.newPassword && (
                    <div className="invalid-feedback">{fieldErrors.newPassword}</div>
                  )}
                </div>
              </div>

              <FormInput
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                label="Confirm New Password *"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
                required
              />

              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1"
                  onClick={() => setStep(1)}
                  disabled={busy}
                >
                  <i className="bi bi-arrow-left me-1" />
                  Change Email
                </button>
                <button
                  type="submit"
                  className="btn btn-teal flex-grow-1 shadow-sm"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="tc-auth-switch pt-3 mt-4 border-top d-flex justify-content-between align-items-center small">
            <span className="text-muted">Remembered your password?</span>
            <Link to="/login/citizen" className="fw-bold text-teal">
              Back to Login
            </Link>
          </div>
        </div>
      </section>

      {/* Right Side Info Pane */}
      <aside className="tc-auth-aside">
        <div className="tc-auth-aside-content">
          <span className="tc-aside-pill citizen">
            <i className="bi bi-shield-lock me-1" /> Secure Password Reset
          </span>
          <h2>Regain Account Access Fast.</h2>
          <p>
            TrackCivic secures your account with high-grade encryption. Once reset, your new password takes effect immediately.
          </p>
          <div className="tc-aside-bullets mt-4">
            <div><i className="bi bi-check-circle-fill text-success me-2" />Instant 6-digit verification code</div>
            <div><i className="bi bi-check-circle-fill text-info me-2" />15-minute token expiry for protection</div>
            <div><i className="bi bi-check-circle-fill text-warning me-2" />Access preserved for all your civic reports</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

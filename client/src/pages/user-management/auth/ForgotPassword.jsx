import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../../components/auth/AuthShell';
import { authAPI } from '../../../services/api';
import './AuthPages.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal') === 'admin' ? 'admin' : 'user';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const steps = useMemo(() => ['Send OTP', 'Verify OTP', 'Create New Password'], []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.forgotPassword({
        email: formData.email,
        portal,
      });

      setSuccess(response.message || 'If the account exists, an OTP has been sent');
      setStep(2);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send the OTP right now');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.verifyOtp({
        email: formData.email,
        otp: formData.otp,
        portal,
      });

      setResetToken(response.data.resetToken);
      setSuccess('OTP verified. You can now create a new password.');
      setStep(3);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify the OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        resetToken,
        newPassword: formData.newPassword,
      });

      setSuccess('Password updated successfully. Redirecting you to the login page...');
      setTimeout(() => {
        navigate(portal === 'admin' ? '/adminlogin' : '/userlogin', { replace: true });
      }, 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      portal={portal}
      heading={portal === 'admin' ? 'Recover admin access' : 'Reset your user password'}
      subheading="The flow is simple: request an OTP by email, verify it, then create your new password."
    >
      <div className="auth-card">
        <p className="auth-card__eyebrow">Password recovery</p>
        <h2 className="auth-card__title">Forgot password</h2>
        <p className="auth-card__description">
          We will send a one-time password to your registered email address.
        </p>

        <div className="auth-steps">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`auth-steps__item ${step === index + 1 ? 'active' : ''}`}
            >
              <span>{index + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
        {success ? <div className="auth-alert auth-alert--success">{success}</div> : null}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <div className="auth-form__field">
              <label htmlFor="email">Registered email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div className="auth-form__actions">
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="auth-form__field">
              <label htmlFor="otp">Email OTP</label>
              <input
                id="otp"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter the 6 digit OTP"
                required
              />
            </div>

            <div className="auth-form__actions">
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button className="auth-btn--ghost" type="button" onClick={() => setStep(1)}>
                Change Email
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="auth-form__grid">
              <div className="auth-form__field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Create a new password"
                  required
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat the new password"
                  required
                />
              </div>
            </div>

            <div className="auth-form__actions">
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Create New Password'}
              </button>
            </div>
          </form>
        ) : null}

        <p className="auth-form__switch">
          Ready to sign in again?{' '}
          <Link to={portal === 'admin' ? '/adminlogin' : '/userlogin'}>
            Return to the login page
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;

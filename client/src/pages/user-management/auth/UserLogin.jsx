import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../../components/auth/AuthShell';
import { useAuth } from '../../../context/AuthContext';
import './AuthPages.css';

const loginStory = {
  eyebrow: 'Traveler login',
  brandLabel: 'Returning traveler',
  title: 'Return to the stays you saved.',
  description:
    'Pick up your Sri Lanka plans, revisit favorite hotels, and keep every detail in one calm account experience.',
  highlights: [
    {
      title: 'Shortlist ready',
      text: 'Your saved properties stay organized for the next visit.',
    },
    {
      title: 'Profile in place',
      text: 'Traveler details stay ready when you want to update them.',
    },
    {
      title: 'Quick recovery',
      text: 'Account access is easy to recover through secure OTP verification.',
    },
  ],
};

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(formData);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell portal="user" story={loginStory}>
      <div className="auth-card">
        <p className="auth-card__eyebrow">User login</p>
        <h2 className="auth-card__title">Welcome back</h2>
        <p className="auth-card__description">
          Sign in with your email and password to continue planning.
        </p>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="traveler@example.com"
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="auth-form__helper-row">
            <span className="auth-card__meta">Forgot your password?</span>
            <Link className="auth-form__helper-link" to="/forgot-password?portal=user">
              Reset with OTP
            </Link>
          </div>

          <div className="auth-form__actions">
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="auth-form__switch">
          Need an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default UserLogin;

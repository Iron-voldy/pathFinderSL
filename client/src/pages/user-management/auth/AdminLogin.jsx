import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../../components/auth/AuthShell';
import { useAuth } from '../../../context/AuthContext';
import './AuthPages.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dev/hotels';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAdmin(formData);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      portal="admin"
      heading="Secure staff access to operations"
      subheading="This admin portal is protected and separate from the public traveler interface. Only authorized administrators can access hotel management tools."
    >
      <div className="auth-card">
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">Admin Portal</p>
          <h2 className="auth-card__title">Staff Login</h2>
          <p className="auth-card__description">
            Access the hotel operations dashboard with your admin credentials.
          </p>
        </div>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@pathfindersl.com"
              required
              autoFocus
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
              placeholder="Enter your secure password"
              required
            />
          </div>

          <div className="auth-form__helper-row">
            <span className="auth-card__meta">Need help accessing your account?</span>
            <Link className="auth-form__helper-link" to="/forgot-password?portal=admin">
              Recover password
            </Link>
          </div>

          <div className="auth-form__actions">
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Authenticating…' : 'Enter Admin Portal'}
            </button>
          </div>
        </form>

        <p className="auth-form__switch">
          Not a staff member? <Link to="/userlogin">Go to traveler login</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default AdminLogin;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../../components/auth/AuthShell';
import { useAuth } from '../../../context/AuthContext';
import './AuthPages.css';

const registerStory = {
  eyebrow: 'Create account',
  brandLabel: 'New traveler',
  title: 'Start a traveler profile that feels ready from day one.',
  description:
    'Create your PathFinderSL account once and keep your hotel ideas, traveler details, and secure recovery options together.',
  highlights: [
    {
      title: 'Save hotel ideas',
      text: 'Build a shortlist while you compare stays across Sri Lanka.',
    },
    {
      title: 'Profile details',
      text: 'Keep your account information ready for future planning.',
    },
    {
      title: 'Secure access',
      text: 'Password recovery stays simple with an OTP-based flow.',
    },
  ],
};

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell portal="user" story={registerStory}>
      <div className="auth-card auth-card--compact">
        <p className="auth-card__eyebrow">User registration</p>
        <h2 className="auth-card__title">Create your account</h2>
        <p className="auth-card__description">
          A few details and you are ready to save your next stays.
        </p>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

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

          <div className="auth-form__grid">
            <div className="auth-form__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>

          <div className="auth-form__actions">
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="auth-form__switch">
          Already registered? <Link to="/userlogin">Go to user login</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Register;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/shared/Navbar';
import Footer from '../../../components/shared/Footer';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, isAdmin, updateProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    location: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      fullName: user.fullName || '',
      nationality: user.nationality || '',
      location: user.location || '',
      profilePicture: user.profilePicture || '',
    });
  }, [user]);

  const initials = useMemo(() => {
    const source = user?.fullName || user?.email || 'PF';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Your profile has been updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePassword);
      navigate('/');
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message || 'Unable to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <section className="profile-page__hero">
          <div className="profile-page__hero-copy">
            <p className="profile-page__eyebrow">My account</p>
            <h1>Manage your PathFinderSL profile</h1>
            <p>
              Keep your personal details ready for faster travel planning and a smoother booking
              experience.
            </p>
          </div>
        </section>

        <section className="profile-page__content">
          <aside className="profile-card profile-card--summary">
            <div className="profile-avatar">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt={formData.fullName || 'Profile'}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <span>{initials || 'PF'}</span>
            </div>

            <h2>{user?.fullName}</h2>
            <p className="profile-card__email">{user?.email}</p>

            <div className="profile-card__chips">
              <span>{isAdmin ? 'Admin account' : 'Traveler account'}</span>
              <span>{user?.nationality || 'Nationality not set'}</span>
            </div>

            <div className="profile-card__meta-list">
              <div>
                <span>Member since</span>
                <strong>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </strong>
              </div>
              <div>
                <span>Last login</span>
                <strong>
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First login'}
                </strong>
              </div>
              <div>
                <span>Saved locations</span>
                <strong>{user?.location || 'Add your preferred locations'}</strong>
              </div>
            </div>

            {isAdmin ? (
              <Link className="profile-card__link" to="/admin/dev/hotels">
                Open admin dashboard
              </Link>
            ) : (
              <Link className="profile-card__link" to="/hotels">
                Explore hotels
              </Link>
            )}

            <button className="profile-card__logout" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </aside>

          <section className="profile-card profile-card--form">
            <div className="profile-card__header">
              <div>
                <p className="profile-page__eyebrow">Profile details</p>
                <h2>Update your information</h2>
              </div>
              <p>
                Add your nationality, preferred locations, and a profile picture link for a more
                complete account.
              </p>
            </div>

            {error ? <div className="profile-alert profile-alert--error">{error}</div> : null}
            {message ? <div className="profile-alert profile-alert--success">{message}</div> : null}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form__grid">
                <div className="profile-form__field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="profile-form__field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" type="email" value={user?.email || ''} readOnly />
                </div>
              </div>

              <div className="profile-form__grid">
                <div className="profile-form__field">
                  <label htmlFor="nationality">Nationality</label>
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Sri Lankan"
                  />
                </div>

                <div className="profile-form__field">
                  <label htmlFor="location">Locations</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Colombo, Kandy, Galle"
                  />
                </div>
              </div>

              <div className="profile-form__field">
                <label htmlFor="profilePicture">Profile picture URL</label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="url"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div className="profile-form__actions">
                <button className="profile-form__submit" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Delete Account Section */}
          <section className="profile-card profile-card--danger">
            <div className="profile-card__header">
              <div>
                <p className="profile-page__eyebrow" style={{ color: '#b42318' }}>Danger zone</p>
                <h2>Delete your account</h2>
              </div>
              <p>
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                className="profile-delete-btn"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete my account
              </button>
            ) : (
              <form className="profile-delete-form" onSubmit={handleDeleteAccount}>
                {deleteError ? (
                  <div className="profile-alert profile-alert--error">{deleteError}</div>
                ) : null}
                <p className="profile-delete-warning">
                  This will permanently delete your account. Enter your password to confirm.
                </p>
                <div className="profile-form__field">
                  <label htmlFor="deletePassword">Confirm password</label>
                  <input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="profile-delete-actions">
                  <button
                    className="profile-delete-cancel"
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="profile-delete-confirm"
                    type="submit"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Permanently delete'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Profile;

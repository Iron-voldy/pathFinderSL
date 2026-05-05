import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCartShopping, faCarSide, faTruckPickup } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const overlayFriendlyRoutes = ['/', '/hotels'];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isDriver, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const navLinks = useMemo(
    () => [
      { path: '/', label: 'Home' },
      { path: '/hotels', label: 'Hotels' },
      { path: '/destinations', label: 'Destinations' },
      { path: '/transport', label: 'Transport' },
      ...(isAuthenticated && !isAdmin ? [
        { path: '/budget', label: 'Budget Planner' },
        { path: '/cart', label: 'Cart' },
        { path: '/orders', label: 'My Orders' },
      ] : []),
    ],
    [isAuthenticated, isAdmin, isDriver]
  );

  const isSolid =
    !overlayFriendlyRoutes.includes(location.pathname) && !location.pathname.startsWith('/hotels/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  const initials = (user?.fullName || user?.email || 'PF')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const isActive = (path) =>
    path === '/' ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${isSolid ? 'navbar-solid' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">PathFinder</span>
          <span className="logo-highlight">SL</span>
        </Link>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <div className="navbar-menu-auth">
              <Link to="/userlogin" className="navbar-btn navbar-btn--secondary">
                User Login
              </Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary">
                Register
              </Link>
            </div>
          ) : (
            <div className="navbar-menu-profile">
              <Link to="/profile" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ fontWeight: 700 }}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/dev/hotels"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hotels Admin
                  </Link>
                  <Link
                    to="/admin/dev/destinations"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Destinations Admin
                  </Link>
                  <Link
                    to="/admin/dev/lifestyles"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Activities Admin
                  </Link>
                  <Link
                    to="/admin/dev/budget"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Budget Admin
                  </Link>
                  <Link
                    to="/admin/dev/orders"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Orders Admin
                  </Link>
                  <Link
                    to="/admin/dev/drivers"
                    className="navbar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Drivers Admin
                  </Link>
                </>
              ) : (
                <Link
                  to="/budget"
                  className="navbar-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Budget Planner
                </Link>
              )}
              <Link
                to="/reviews"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faStar} /> My Reviews
              </Link>
              {!isAdmin && (
                <Link
                  to="/vehicle-bookings"
                  className="navbar-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faTruckPickup} /> Vehicle Bookings
                </Link>
              )}
              {isDriver ? (
                <Link
                  to="/driver/dashboard"
                  className="navbar-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCarSide} /> Driver Dashboard
                </Link>
              ) : (
                <Link
                  to="/driver/apply"
                  className="navbar-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCarSide} /> Become a Driver
                </Link>
              )}
              <button type="button" className="navbar-mobile-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/userlogin" className="navbar-btn navbar-btn--secondary desktop-only">
                User Login
              </Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary desktop-only">
                Register
              </Link>
            </>
          ) : (
            <div className="navbar-account" ref={accountMenuRef}>
              <button
                type="button"
                className="navbar-account__trigger"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
              >
                <span className="navbar-account__avatar">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.fullName || 'Profile'} />
                  ) : (
                    <span>{initials || 'PF'}</span>
                  )}
                </span>
                <span className="navbar-account__text">
                  <strong>{user?.fullName || 'My Profile'}</strong>
                  <small>{isAdmin ? 'Admin account' : 'My Profile'}</small>
                </span>
              </button>

              {isAccountMenuOpen ? (
                <div className="navbar-account__menu">
                  <div className="navbar-account__summary">
                    <strong>{user?.fullName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/profile" className="navbar-account__link">
                    Profile
                  </Link>
                  {!isAdmin ? (
                    <>
                      <Link to="/budget" className="navbar-account__link">
                        Budget Planner
                      </Link>
                      <Link to="/cart" className="navbar-account__link">
                        <FontAwesomeIcon icon={faCartShopping} /> My Cart
                      </Link>
                      <Link to="/orders" className="navbar-account__link">
                        My Orders
                      </Link>
                      <Link to="/vehicle-bookings" className="navbar-account__link">
                        <FontAwesomeIcon icon={faTruckPickup} /> Vehicle Bookings
                      </Link>
                      <Link to="/reviews" className="navbar-account__link">
                        <FontAwesomeIcon icon={faStar} /> My Reviews
                      </Link>
                      {isDriver ? (
                        <Link to="/driver/dashboard" className="navbar-account__link">
                          <FontAwesomeIcon icon={faCarSide} /> Driver Dashboard
                        </Link>
                      ) : (
                        <Link to="/driver/apply" className="navbar-account__link">
                          <FontAwesomeIcon icon={faCarSide} /> Become a Driver
                        </Link>
                      )}
                    </>
                  ) : null}
                  {isAdmin ? (
                    <>
                      <Link to="/admin/dashboard" className="navbar-account__link" style={{ fontWeight: 700, color: '#0c618a' }}>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/dev/hotels" className="navbar-account__link">
                        Hotels Management
                      </Link>
                      <Link to="/admin/dev/destinations" className="navbar-account__link">
                        Destinations Management
                      </Link>
                      <Link to="/admin/dev/lifestyles" className="navbar-account__link">
                        Activities Management
                      </Link>
                      <Link to="/admin/dev/budget" className="navbar-account__link">
                        Budget Management
                      </Link>
                      <Link to="/admin/dev/orders" className="navbar-account__link">
                        Orders Management
                      </Link>
                      <Link to="/admin/dev/drivers" className="navbar-account__link">
                        Drivers Management
                      </Link>
                    </>
                  ) : null}
                  <button type="button" className="navbar-account__logout" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          )}

          <button
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Toggle menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

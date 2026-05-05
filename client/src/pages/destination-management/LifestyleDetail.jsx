import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faLocationDot, faStar, faCartShopping,
  faCircleInfo, faMap, faCalendarDays, faPersonWalking,
  faTag, faChild, faUserGroup, faEye,
} from '@fortawesome/free-solid-svg-icons';
import { lifestylesAPI, cartAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './LifestyleDetail.css';

export default function LifestyleDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Cart form
  const [showCartForm, setShowCartForm] = useState(false);
  const [cartForm, setCartForm] = useState({ event_date: '', adult_count: 1, child_count: 0 });
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState('');
  const [newCartName, setNewCartName] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState('');

  useEffect(() => {
    fetchActivity();
    fetchReviews();
  }, [id]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await lifestylesAPI.getById(id);
      setActivity(res.data);
    } catch {
      setError('Activity not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getItemReviews('lifestyle', id);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setReviewCount(res.data.count || 0);
    } catch { /* ok */ }
  };

  const fetchCarts = async () => {
    try {
      const res = await cartAPI.getCarts();
      setCarts(res.data || []);
      if (res.data.length > 0 && !selectedCartId) setSelectedCartId(String(res.data[0].id));
    } catch { /* ok */ }
  };

  const openCartForm = () => {
    setShowCartForm(true);
    if (isAuthenticated) fetchCarts();
  };

  const handleAddToCart = async () => {
    if (!cartForm.event_date) return;
    setAddingToCart(true);
    setCartSuccess('');
    try {
      let cartId = selectedCartId;
      if (cartId === 'new' || !cartId) {
        const res = await cartAPI.createCart({ cart_name: newCartName || 'My Cart' });
        cartId = res.data.id;
        setSelectedCartId(String(cartId));
      }
      await cartAPI.addItem(cartId, {
        item_type: 'lifestyle',
        item_id: activity.lifestyle_id,
        item_name: activity.lifestyle_name,
        item_image: activity.image || '',
        event_date: cartForm.event_date,
        adult_count: cartForm.adult_count,
        child_count: cartForm.child_count,
        unit_price: parseFloat(activity.adult_rate) || 0,
        currency: activity.currency || 'LKR',
      });
      setCartSuccess('Added to cart successfully!');
      setShowCartForm(false);
      setTimeout(() => setCartSuccess(''), 3000);
    } catch {
      setCartSuccess('Failed to add to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="ls-detail-page">
          <div className="ls-detail-loader">
            <div className="ls-detail-spinner" />
            <p>Loading activity details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !activity) {
    return (
      <>
        <Navbar />
        <div className="ls-detail-page">
          <div className="ls-detail-error">
            <FontAwesomeIcon icon={faCircleInfo} size="2x" />
            <p>{error || 'Activity not found.'}</p>
            <Link to="/destinations" className="ls-btn-back">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Destinations
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ls-detail-page">
        {/* Hero */}
        {activity.image ? (
          <div className="ls-detail-hero">
            <img src={activity.image} alt={activity.lifestyle_name}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
            <div className="ls-detail-hero__overlay" />
          </div>
        ) : (
          <div className="ls-detail-hero ls-detail-hero--no-image" />
        )}

        <div className="ls-detail-container">
          <Link to={-1} className="ls-btn-back">
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </Link>

          <div className="ls-detail-grid">
            {/* Main content */}
            <main className="ls-detail-main">
              {/* Header card */}
              <div className="ls-detail-card">
                <div className="ls-detail-header">
                  {activity.lifestyle_attraction_type && (
                    <span className="ls-type-badge">
                      <FontAwesomeIcon icon={faTag} /> {activity.lifestyle_attraction_type}
                    </span>
                  )}
                  <h1>{activity.lifestyle_name}</h1>
                  {(activity.address || activity.lifestyle_city) && (
                    <p className="ls-location">
                      <FontAwesomeIcon icon={faLocationDot} />
                      {activity.address || activity.lifestyle_city}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {activity.lifestyle_description && (
                <div className="ls-detail-card">
                  <h2 className="ls-section-title">
                    <FontAwesomeIcon icon={faCircleInfo} /> About This Activity
                  </h2>
                  <p className="ls-description">{activity.lifestyle_description}</p>
                </div>
              )}

              {/* Sub description highlight */}
              {activity.sub_description && (
                <div className="ls-detail-card ls-highlight-card">
                  <p className="ls-sub-description">{activity.sub_description}</p>
                </div>
              )}

              {/* Selling points */}
              {activity.selling_points && (
                <div className="ls-detail-card">
                  <h2 className="ls-section-title">
                    <FontAwesomeIcon icon={faPersonWalking} /> What to Expect
                  </h2>
                  <p className="ls-description">{activity.selling_points}</p>
                </div>
              )}

              {/* Location info */}
              {(activity.lifestyle_city || activity.micro_location || activity.address) && (
                <div className="ls-detail-card">
                  <h2 className="ls-section-title">
                    <FontAwesomeIcon icon={faMap} /> Location Details
                  </h2>
                  <div className="ls-info-grid">
                    {activity.lifestyle_city && (
                      <div className="ls-info-item">
                        <span className="ls-info-label">City</span>
                        <span className="ls-info-value">{activity.lifestyle_city}</span>
                      </div>
                    )}
                    {activity.micro_location && (
                      <div className="ls-info-item">
                        <span className="ls-info-label">Area</span>
                        <span className="ls-info-value">{activity.micro_location}</span>
                      </div>
                    )}
                    {activity.address && (
                      <div className="ls-info-item">
                        <span className="ls-info-label">Address</span>
                        <span className="ls-info-value">{activity.address}</span>
                      </div>
                    )}
                    {activity.latitude && activity.longitude && (
                      <div className="ls-info-item">
                        <span className="ls-info-label">Coordinates</span>
                        <span className="ls-info-value">
                          {parseFloat(activity.latitude).toFixed(5)}, {parseFloat(activity.longitude).toFixed(5)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="ls-detail-card ls-reviews-section">
                <h2 className="ls-section-title">
                  <FontAwesomeIcon icon={faStar} /> Reviews & Ratings
                </h2>
                {reviewCount > 0 ? (
                  <div className="ls-reviews-summary">
                    <span className="ls-reviews-stars">
                      {[1,2,3,4,5].map((s) => (
                        <FontAwesomeIcon key={s} icon={faStar}
                          style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : '#e2e8f0' }} />
                      ))}
                    </span>
                    <span className="ls-reviews-avg">{avgRating}</span>
                    <span className="ls-reviews-count">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                  </div>
                ) : (
                  <p className="ls-reviews-empty">No reviews yet. Be the first to review after your visit!</p>
                )}
                <div className="ls-reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="ls-review-card">
                      <div className="ls-review-card__header">
                        <span className="ls-review-card__stars">
                          {[1,2,3,4,5].map((s) => (
                            <FontAwesomeIcon key={s} icon={faStar}
                              style={{ color: s <= r.rating ? '#f59e0b' : '#e2e8f0', fontSize: '0.78rem' }} />
                          ))}
                        </span>
                        <span className="ls-review-card__author">{r.user?.full_name || 'Anonymous'}</span>
                        <span className="ls-review-card__date">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <p className="ls-review-card__comment">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="ls-detail-sidebar">
              {/* Pricing card */}
              {(activity.adult_rate || activity.child_rate) && (
                <div className="ls-detail-card ls-price-card">
                  <h3 className="ls-sidebar-title">Pricing</h3>
                  {activity.adult_rate && parseFloat(activity.adult_rate) > 0 && (
                    <div className="ls-price-row">
                      <span className="ls-price-label">
                        <FontAwesomeIcon icon={faUserGroup} /> Adult
                      </span>
                      <span className="ls-price-value">
                        {activity.currency || 'LKR'} {parseFloat(activity.adult_rate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {activity.child_rate && parseFloat(activity.child_rate) > 0 && (
                    <div className="ls-price-row">
                      <span className="ls-price-label">
                        <FontAwesomeIcon icon={faChild} /> Child
                      </span>
                      <span className="ls-price-value">
                        {activity.currency || 'LKR'} {parseFloat(activity.child_rate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Cart card */}
              <div className="ls-detail-card ls-cart-card">
                <h3 className="ls-sidebar-title">
                  <FontAwesomeIcon icon={faCartShopping} /> Book This Activity
                </h3>
                {cartSuccess && <div className="ls-cart-success">{cartSuccess}</div>}
                {!showCartForm ? (
                  <>
                    <p className="ls-cart-text">
                      Add this activity to your cart and checkout via WhatsApp.
                    </p>
                    <button className="ls-btn-primary" onClick={openCartForm}>
                      <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                    </button>
                    <Link to="/cart" className="ls-btn-secondary">
                      <FontAwesomeIcon icon={faEye} /> View Cart
                    </Link>
                  </>
                ) : !isAuthenticated ? (
                  <div className="ls-cart-login">
                    <p>Please log in to add this activity to your cart.</p>
                    <Link to="/userlogin" className="ls-btn-primary">Log In</Link>
                  </div>
                ) : (
                  <div className="ls-cart-form">
                    <label>
                      <FontAwesomeIcon icon={faCalendarDays} /> Event Date *
                      <input type="date" value={cartForm.event_date}
                        onChange={(e) => setCartForm({ ...cartForm, event_date: e.target.value })} />
                    </label>
                    <div className="ls-cart-form-row">
                      <label>
                        <FontAwesomeIcon icon={faUserGroup} /> Adults
                        <input type="number" min="1" value={cartForm.adult_count}
                          onChange={(e) => setCartForm({ ...cartForm, adult_count: parseInt(e.target.value) || 1 })} />
                      </label>
                      <label>
                        <FontAwesomeIcon icon={faChild} /> Children
                        <input type="number" min="0" value={cartForm.child_count}
                          onChange={(e) => setCartForm({ ...cartForm, child_count: parseInt(e.target.value) || 0 })} />
                      </label>
                    </div>
                    <label>
                      Cart
                      <select value={selectedCartId} onChange={(e) => setSelectedCartId(e.target.value)}>
                        {carts.map((c) => <option key={c.id} value={c.id}>{c.cart_name}</option>)}
                        <option value="new">+ New Cart</option>
                      </select>
                    </label>
                    {selectedCartId === 'new' && (
                      <input className="ls-cart-newname" placeholder="Cart name..."
                        value={newCartName} onChange={(e) => setNewCartName(e.target.value)} />
                    )}
                    <div className="ls-cart-form-actions">
                      <button className="ls-btn-primary"
                        disabled={addingToCart || !cartForm.event_date}
                        onClick={handleAddToCart}>
                        <FontAwesomeIcon icon={faCartShopping} />
                        {addingToCart ? ' Adding...' : ' Add to Cart'}
                      </button>
                      <button className="ls-btn-cancel"
                        onClick={() => setShowCartForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

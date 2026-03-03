import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faLocationDot, faStar, faStarHalfStroke, faCartShopping,
  faEye, faBuildingColumns, faTriangleExclamation, faCircleInfo,
  faMap, faBuilding, faCheckCircle, faShoppingBag, faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';
import { hotelsAPI, cartAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './HotelDetail.css';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getNightCount = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;

  const [startYear, startMonth, startDay] = checkIn.split('-').map(Number);
  const [endYear, endMonth, endDay] = checkOut.split('-').map(Number);

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
  const diffInDays = (endUtc - startUtc) / MS_PER_DAY;

  return diffInDays > 0 ? diffInDays : null;
};

const getNextDate = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day));
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return nextDate.toISOString().split('T')[0];
};

const HotelDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const detailRef = useRef(null);

  // Cart form state
  const [showCartForm, setShowCartForm] = useState(false);
  const [cartForm, setCartForm] = useState({ check_in: '', check_out: '', adult_count: 1, child_count: 0, notes: '' });
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState('');
  const [newCartName, setNewCartName] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState('');
  const [cartFormErrors, setCartFormErrors] = useState({});

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const cartNights = getNightCount(cartForm.check_in, cartForm.check_out);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (hotel && detailRef.current) {
      // Animate using element ref, not class selectors, to avoid Strict Mode opacity stuck at 0
      gsap.fromTo(
        detailRef.current.querySelectorAll('.detail-header, .detail-section'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
    }
  }, [hotel]);

  const fetchHotel = async () => {
    setLoading(true);
    try {
      const response = await hotelsAPI.getById(id);
      setHotel(response.data);
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getItemReviews('hotel', id);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setReviewCount(res.data.count || 0);
    } catch { /* ok */ }
  };

  const fetchCarts = async () => {
    try {
      const res = await cartAPI.getCarts();
      setCarts(res.data || []);
      if (res.data.length > 0 && !selectedCartId) {
        setSelectedCartId(String(res.data[0].id));
      }
    } catch { /* ok */ }
  };

  useEffect(() => { fetchReviews(); }, [id]);

  const handleAddToCart = async () => {
    const errors = {};
    if (!cartForm.check_in) {
      errors.check_in = 'Check-in date is required.';
    } else if (cartForm.check_in < tomorrowStr) {
      errors.check_in = 'Check-in must be from tomorrow onwards.';
    }
    if (!cartForm.check_out) {
      errors.check_out = 'Check-out date is required.';
    } else if (cartForm.check_in && cartForm.check_out <= cartForm.check_in) {
      errors.check_out = 'Check-out must be after check-in date.';
    }
    if (!cartForm.adult_count || cartForm.adult_count < 1) {
      errors.adult_count = 'At least 1 adult required.';
    }
    if (selectedCartId === 'new' && !newCartName.trim()) {
      errors.cart_name = 'Please enter a cart name.';
    }
    if (Object.keys(errors).length > 0) {
      setCartFormErrors(errors);
      return;
    }
    setCartFormErrors({});
    setAddingToCart(true);
    setCartSuccess('');
    try {
      let cartId = selectedCartId;
      if (cartId === 'new' || !cartId) {
        const res = await cartAPI.createCart({ cart_name: newCartName || 'My Cart' });
        cartId = res.data.id;
        setSelectedCartId(String(cartId));
      }
      const nights = cartNights || 1;
      const pricePerNight = parseFloat(hotel.markup) || 0;
      const totalPrice = pricePerNight * nights;

      await cartAPI.addItem(cartId, {
        item_type: 'hotel',
        item_id: hotel.id,
        item_name: hotel.hotel_name,
        item_image: hotel.hotel_image || '',
        check_in: cartForm.check_in,
        check_out: cartForm.check_out,
        adult_count: cartForm.adult_count,
        child_count: cartForm.child_count,
        unit_price: totalPrice,
        currency: 'LKR',
        notes: cartForm.notes,
      });
      setCartSuccess('Added to cart!');
      setShowCartForm(false);
      setTimeout(() => setCartSuccess(''), 3000);
    } catch { setCartSuccess('Failed to add.'); }
    finally { setAddingToCart(false); }
  };

  const openCartForm = () => {
    setShowCartForm(true);
    setCartFormErrors({});
    if (isAuthenticated) fetchCarts();
  };

  const handleCartCheckInChange = (value) => {
    const nextCheckOut = getNextDate(value);

    setCartForm((prev) => ({
      ...prev,
      check_in: value,
      check_out: !prev.check_out || prev.check_out <= value ? nextCheckOut : prev.check_out,
    }));

    if (cartFormErrors.check_in || cartFormErrors.check_out) {
      setCartFormErrors((prev) => ({ ...prev, check_in: '', check_out: '' }));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="hotel-detail-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading hotel details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div className="hotel-detail-page">
          <div className="error-state">
            <h2>Hotel not found</h2>
            <Link to="/hotels" className="btn-back">← Back to Hotels</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="hotel-detail-page" ref={detailRef}>
      {/* Hero Image */}
      <div className="detail-hero">
        <img
          src={hotel.hotel_image || '/placeholder-hotel.jpg'}
          alt={hotel.hotel_name}
          onError={(e) => {
            e.target.src = '/placeholder-hotel.jpg';
          }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="container">
        <Link to="/hotels" className="btn-back-link">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Hotels
        </Link>

        {/* Header */}
        <div className="detail-header">
          <div className="header-main">
            <h1>{hotel.hotel_name}</h1>
            <p className="location">
              <FontAwesomeIcon icon={faLocationDot} />
              {hotel.hotel_address || `${hotel.city}, ${hotel.country}`}
            </p>
          </div>
          <div className="header-meta">
            {hotel.star_classification && (
              <div className="rating-badge">{hotel.star_classification}</div>
            )}
            {hotel.hotel_classification && (
              <div className="type-badge">{hotel.hotel_classification}</div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="detail-grid">
          {/* Main Content */}
          <div className="detail-main">
            {/* Description */}
            {hotel.hotel_description && (
              <div className="detail-section">
                <h2>About This Property</h2>
                <p className="description">{hotel.hotel_description}</p>
              </div>
            )}

            {hotel.sub_description && (
              <div className="detail-section">
                <div className="highlight-box">
                  <span className="highlight-icon"><FontAwesomeIcon icon={faCircleInfo} /></span>
                  <p>{hotel.sub_description}</p>
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="detail-section">
              <h2><FontAwesomeIcon icon={faMap} /> Location</h2>
              <div className="info-grid">
                {hotel.city && (
                  <div className="info-item">
                    <span className="info-label">City</span>
                    <span className="info-value">{hotel.city}</span>
                  </div>
                )}
                {hotel.country && (
                  <div className="info-item">
                    <span className="info-label">Country</span>
                    <span className="info-value">{hotel.country}</span>
                  </div>
                )}
                {hotel.micro_location && (
                  <div className="info-item">
                    <span className="info-label">Area</span>
                    <span className="info-value">{hotel.micro_location}</span>
                  </div>
                )}
                {hotel.latitude && hotel.longitude && (
                  <div className="info-item">
                    <span className="info-label">Coordinates</span>
                    <span className="info-value">
                      {hotel.latitude}, {hotel.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="detail-section">
              <h2><FontAwesomeIcon icon={faBuilding} /> Property Details</h2>
              <div className="info-grid">
                {hotel.provider && (
                  <div className="info-item">
                    <span className="info-label">Provider</span>
                    <span className="info-value">{hotel.provider}</span>
                  </div>
                )}
                {hotel.hotel_status && (
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`status-badge status-${hotel.hotel_status}`}>
                      {hotel.hotel_status}
                    </span>
                  </div>
                )}
                {hotel.auto_confirmation !== null && (
                  <div className="info-item">
                    <span className="info-label">Instant Confirmation</span>
                    <span className="info-value">
                      {hotel.auto_confirmation ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {hotel.trip_advisor_link && (
              <div className="detail-section">
                <a
                  href={hotel.trip_advisor_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  View on TripAdvisor →
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3><FontAwesomeIcon icon={faCartShopping} /> Book This Property</h3>
              {cartSuccess && <div className="cart-success-msg">{cartSuccess}</div>}
              {!showCartForm ? (
                <>
                  <p className="sidebar-text">
                    Add this hotel to your cart and checkout via WhatsApp.
                  </p>
                  <button className="btn-book" onClick={openCartForm}>
                    <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                  </button>
                  <Link to="/cart" className="btn-contact">View Cart</Link>
                </>
              ) : !isAuthenticated ? (
                <div className="cart-form-login">
                  <p>Please log in to add items to your cart.</p>
                  <Link to="/userlogin" className="btn-book">Log In</Link>
                </div>
              ) : (
                <div className="cart-form">
                  <div className="cart-form-dates">
                    <label>Check-in *
                      <input type="date" value={cartForm.check_in} min={tomorrowStr}
                        className={cartFormErrors.check_in ? 'input-error' : ''}
                        onChange={(e) => handleCartCheckInChange(e.target.value)} />
                      {cartFormErrors.check_in && <span className="hd-field-error">{cartFormErrors.check_in}</span>}
                    </label>
                    <div className={`cart-night-count${cartNights ? ' is-active' : ''}`} aria-live="polite">
                      {cartNights ? `${cartNights} Night${cartNights > 1 ? 's' : ''}` : 'Select dates'}
                    </div>
                    <label>Check-out *
                      <input type="date" value={cartForm.check_out} min={cartForm.check_in || tomorrowStr}
                        className={cartFormErrors.check_out ? 'input-error' : ''}
                        onChange={(e) => {
                          setCartForm({ ...cartForm, check_out: e.target.value });
                          if (cartFormErrors.check_out) setCartFormErrors((p) => ({ ...p, check_out: '' }));
                        }} />
                      {cartFormErrors.check_out && <span className="hd-field-error">{cartFormErrors.check_out}</span>}
                    </label>
                  </div>
                  <div className="cart-form-row">
                    <label>Adults
                      <input type="number" min="1" value={cartForm.adult_count}
                        className={cartFormErrors.adult_count ? 'input-error' : ''}
                        onChange={(e) => {
                          setCartForm({ ...cartForm, adult_count: parseInt(e.target.value) || 1 });
                          if (cartFormErrors.adult_count) setCartFormErrors((p) => ({ ...p, adult_count: '' }));
                        }} />
                      {cartFormErrors.adult_count && <span className="hd-field-error">{cartFormErrors.adult_count}</span>}
                    </label>
                    <label>Children
                      <input type="number" min="0" value={cartForm.child_count}
                        onChange={(e) => setCartForm({ ...cartForm, child_count: parseInt(e.target.value) || 0 })} />
                    </label>
                  </div>
                  <label>Notes
                    <textarea rows="2" value={cartForm.notes} placeholder="Special requests…"
                      onChange={(e) => setCartForm({ ...cartForm, notes: e.target.value })} />
                  </label>
                  <label>Add to Cart
                    <select value={selectedCartId} onChange={(e) => setSelectedCartId(e.target.value)}>
                      {carts.map((c) => <option key={c.id} value={c.id}>{c.cart_name}</option>)}
                      <option value="new">+ New Cart</option>
                    </select>
                  </label>
                  {selectedCartId === 'new' && (
                    <>
                      <input className={`cart-form-newname${cartFormErrors.cart_name ? ' input-error' : ''}`}
                        placeholder="Cart name…" value={newCartName}
                        onChange={(e) => {
                          setNewCartName(e.target.value);
                          if (cartFormErrors.cart_name) setCartFormErrors((p) => ({ ...p, cart_name: '' }));
                        }} />
                      {cartFormErrors.cart_name && <span className="hd-field-error">{cartFormErrors.cart_name}</span>}
                    </>
                  )}
                  <div className="cart-form-actions">
                    <button className="btn-book" disabled={addingToCart}
                      onClick={handleAddToCart}>
                      <FontAwesomeIcon icon={faCartShopping} /> {addingToCart ? 'Adding…' : 'Add to Cart'}
                    </button>
                    <button className="btn-cancel" onClick={() => setShowCartForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {hotel.markup && (
              <div className="sidebar-card">
                <div className="info-row">
                  <span>Price per Night</span>
                  <span className="text-primary font-semibold">LKR {Number(hotel.markup).toLocaleString()}</span>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ── Reviews section ──────────────────────────────── */}
        <div className="detail-section reviews-section">
          <h2><FontAwesomeIcon icon={faStar} /> Reviews & Ratings</h2>
          {reviewCount > 0 ? (
            <div className="reviews-summary">
              <span className="reviews-avg">
                {[1,2,3,4,5].map((s) => (
                  <FontAwesomeIcon key={s} icon={faStar} style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : '#e2e8f0' }} />
                ))}
              </span>
              <span className="reviews-avg-num">{avgRating}</span>
              <span className="reviews-count">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            </div>
          ) : (
            <p className="reviews-empty">No reviews yet. Be the first to review after your stay!</p>
          )}
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-card__header">
                  <span className="review-card__stars">
                    {[1,2,3,4,5].map((s) => (
                      <FontAwesomeIcon key={s} icon={faStar} style={{ color: s <= r.rating ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }} />
                    ))}
                  </span>
                  <span className="review-card__author">{r.user?.full_name || 'Anonymous'}</span>
                  <span className="review-card__date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="review-card__comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
};

export default HotelDetail;

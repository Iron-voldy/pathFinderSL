import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faMasksTheater, faCalendarDays, faUsers, faStar, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { ordersAPI, reviewsAPI } from '../../services/api';
import './Orders.css';
import './ReviewModal.css';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  confirmed: { bg: '#dcfce7', color: '#16a34a', label: 'Confirmed' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewedItems, setReviewedItems] = useState(new Set());
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewErrors, setReviewErrors] = useState({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getOrders();
      setOrders(res.data || []);
      // Build set of already-reviewed items
      const reviewed = new Set();
      for (const order of (res.data || [])) {
        if (order.reviews) {
          order.reviews.forEach((r) => reviewed.add(`${r.order_id}-${r.item_type}-${r.item_id}`));
        }
      }
      setReviewedItems(reviewed);
    } catch { setError('Failed to load orders.'); }
    finally { setLoading(false); }
  };

  const openReviewModal = (orderId, item) => {
    setReviewModal({ order_id: orderId, item_type: item.item_type, item_id: item.item_id, item_name: item.item_name });
    setReviewForm({ rating: 5, comment: '' });
    setReviewSuccess('');
    setReviewErrors({});
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    const errors = {};
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      errors.rating = 'Please select a rating.';
    }
    if (!reviewForm.comment.trim()) {
      errors.comment = 'Please enter a comment.';
    } else if (reviewForm.comment.trim().length < 5) {
      errors.comment = 'Comment must be at least 5 characters.';
    } else if (reviewForm.comment.trim().length > 500) {
      errors.comment = 'Comment must be under 500 characters.';
    }
    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      return;
    }
    setReviewErrors({});
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        order_id: reviewModal.order_id,
        item_type: reviewModal.item_type,
        item_id: reviewModal.item_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewSuccess('Review submitted!');
      setReviewedItems((prev) => new Set([...prev, `${reviewModal.order_id}-${reviewModal.item_type}-${reviewModal.item_id}`]));
      setTimeout(() => { setReviewModal(null); setReviewSuccess(''); }, 1500);
    } catch (err) {
      setReviewSuccess(err?.response?.data?.message || 'Failed to submit review.');
    }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <><Navbar />
      <div className="orders-page"><div className="orders-loading"><div className="orders-spinner" /><p>Loading orders…</p></div></div>
      <Footer /></>
  );

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>Order History</h1>
            <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>

          {error && <div className="orders-alert">{error}</div>}

          {orders.length === 0 ? (
            <div className="orders-empty">
              <p>No orders yet.</p>
              <Link to="/hotels">Browse Hotels</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const sm = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card__header">
                      <div>
                        <span className="order-card__number">#{order.order_number}</span>
                        <span className="order-card__date">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span className="order-card__status" style={{ background: sm.bg, color: sm.color }}>
                        {sm.label}
                      </span>
                    </div>
                    <div className="order-card__items">
                      {(order.items || []).map((item) => {
                        const key = `${order.id}-${item.item_type}-${item.item_id}`;
                        const hasReviewed = reviewedItems.has(key);
                        const typeLogo = item.item_type === 'hotel' ? '🏨' : '🎭';
                        return (
                          <div key={item.id} className="order-item">
                            <div className="order-item__img">
                              {item.item_image
                                ? <img src={item.item_image} alt={item.item_name} />
                                : <span>{typeLogo}</span>}
                            </div>
                            <div className="order-item__info">
                              <strong>{item.item_name}</strong>
                              <span className="order-item__type">{item.item_type === 'hotel' ? 'Hotel' : 'Activity'}</span>
                              {item.check_in && <span className="order-item__dates">📅 {item.check_in} → {item.check_out}</span>}
                              {item.event_date && <span className="order-item__dates">📅 {item.event_date}</span>}
                              <span className="order-item__guests">👥 {item.adult_count} adult{item.adult_count !== 1 ? 's' : ''}{item.child_count > 0 ? `, ${item.child_count} child${item.child_count !== 1 ? 'ren' : ''}` : ''}</span>
                            </div>
                            <div className="order-item__price">
                              {item.currency} {parseFloat(item.unit_price).toLocaleString()}
                            </div>
                            {order.status === 'confirmed' && (
                              <button
                                className={'order-item__review-btn' + (hasReviewed ? ' reviewed' : '')}
                                disabled={hasReviewed}
                                onClick={() => openReviewModal(order.id, item)}
                              >
                                {hasReviewed ? <>✓ Reviewed</> : <>⭐ Review</>}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="order-card__footer">
                      <span style={{ fontWeight: 600 }}>Total Booking Value</span>
                      <strong>{order.currency} {parseFloat(order.total_amount).toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="rv-overlay" onClick={() => setReviewModal(null)}>
          <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rv-modal__close" onClick={() => setReviewModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            <div className="rv-modal__header">
              <span className="rv-modal__icon"><FontAwesomeIcon icon={faStar} /></span>
              <h3>Write a Review</h3>
              <p>{reviewModal.item_name}</p>
            </div>
            <div className="rv-modal__body">
              {reviewSuccess && (
                <div className={`rv-modal__msg ${reviewSuccess.includes('!') ? 'rv-modal__msg--success' : 'rv-modal__msg--error'}`}>
                  {reviewSuccess}
                </div>
              )}
              <div className="rv-modal__stars-section">
                <p className="rv-modal__stars-label">Your Rating</p>
                <div className="rv-modal__stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`rv-star ${s <= (hoverRating || reviewForm.rating) ? 'rv-star--active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    >★</button>
                  ))}
                </div>
                <p className="rv-modal__rating-hint">{RATING_LABELS[hoverRating || reviewForm.rating]}</p>
                {reviewErrors.rating && <span className="rv-field-error">{reviewErrors.rating}</span>}
              </div>
              <div className="rv-modal__comment">
                <label>Comment </label>
                <textarea
                  rows="4"
                  value={reviewForm.comment}
                  placeholder="Share your experience…"
                  maxLength={500}
                  className={reviewErrors.comment ? 'input-error' : ''}
                  onChange={(e) => { setReviewForm({ ...reviewForm, comment: e.target.value }); if (reviewErrors.comment) setReviewErrors((p) => ({ ...p, comment: '' })); }}
                />
                {reviewErrors.comment && <span className="rv-field-error">{reviewErrors.comment}</span>}
                <span className="rv-modal__char-count">{reviewForm.comment.length}/500</span>
              </div>
              <div className="rv-modal__actions">
                <button className="rv-modal__cancel" onClick={() => setReviewModal(null)}>Cancel</button>
                <button className="rv-modal__submit" disabled={submittingReview} onClick={handleSubmitReview}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

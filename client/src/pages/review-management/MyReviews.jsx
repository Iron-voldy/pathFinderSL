import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHotel, faMasksTheater, faPenToSquare, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { reviewsAPI } from '../../services/api';
import './ReviewModal.css';
import './MyReviews.css';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState(null); // holds review to delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsAPI.getUserReviews();
      setReviews(res.data || []);
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (review) => {
    setEditModal(review);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
    setEditMsg('');
    setHoverRating(0);
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setSubmitting(true);
    try {
      await reviewsAPI.update(editModal.id, { rating: editForm.rating, comment: editForm.comment });
      setEditMsg('Review updated!');
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editModal.id ? { ...r, rating: editForm.rating, comment: editForm.comment } : r
        )
      );
      setTimeout(() => { setEditModal(null); setEditMsg(''); }, 1500);
    } catch (err) {
      setEditMsg(err?.response?.data?.message || 'Failed to update review.');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemLink = (review) => {
    if (review.item_type === 'hotel') return `/hotels/${review.item_id}`;
    if (review.item_type === 'lifestyle') return `/lifestyle/${review.item_id}`;
    return '#';
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await reviewsAPI.remove(deleteModal.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete review.');
      setDeleteModal(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="mr-page">
        <div className="mr-loading">
          <div className="mr-spinner" />
          <p>Loading your reviews…</p>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="mr-page">
        <div className="mr-container">

          <div className="mr-header">
            <div className="mr-header__text">
              <h1><FontAwesomeIcon icon={faStar} /> My Reviews</h1>
              <p>{reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted</p>
            </div>
            <Link to="/orders" className="mr-header__link">View Orders</Link>
          </div>

          {error && <div className="mr-alert">{error}</div>}

          {reviews.length === 0 ? (
            <div className="mr-empty">
              <div className="mr-empty__icon"><FontAwesomeIcon icon={faStar} /></div>
              <h3>No reviews yet</h3>
              <p>Complete a confirmed order and share your experience!</p>
              <Link to="/orders" className="mr-empty__btn">View My Orders</Link>
            </div>
          ) : (
            <div className="mr-grid">
              {reviews.map((review) => (
                <div key={review.id} className="mr-card">
                  {review.item_image && (
                    <div className="mr-card__img">
                      <img src={review.item_image} alt={review.item_name || review.item_type} />
                      <span className={`mr-card__type-badge mr-card__type-badge--${review.item_type}`}>
                        {review.item_type === 'hotel' ? <><FontAwesomeIcon icon={faHotel} /> Hotel</> : <><FontAwesomeIcon icon={faMasksTheater} /> Activity</>}
                      </span>
                    </div>
                  )}
                  <div className="mr-card__body">
                    <div className="mr-card__top">
                      {!review.item_image && (
                        <span className={`mr-card__type-badge mr-card__type-badge--${review.item_type}`}>
                          {review.item_type === 'hotel' ? <><FontAwesomeIcon icon={faHotel} /> Hotel</> : <><FontAwesomeIcon icon={faMasksTheater} /> Activity</>}
                        </span>
                      )}
                      <span className="mr-card__date">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>

                    <Link to={getItemLink(review)} className="mr-card__name">
                      {review.item_name || `${review.item_type} #${review.item_id}`}
                    </Link>

                    <div className="mr-card__stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`mr-star ${s <= review.rating ? 'mr-star--filled' : ''}`}>★</span>
                      ))}
                      <span className="mr-card__rating-label">{RATING_LABELS[review.rating]}</span>
                    </div>

                    {review.comment
                      ? <p className="mr-card__comment">"{review.comment}"</p>
                      : <p className="mr-card__no-comment">No comment added</p>
                    }

                    {review.Order && (
                      <p className="mr-card__order">Order #{review.Order.order_number}</p>
                    )}
                  </div>

                  <button className="mr-edit-btn" onClick={() => openEdit(review)}>
                    <FontAwesomeIcon icon={faPenToSquare} /> Edit Review
                  </button>
                  <button className="mr-delete-btn" onClick={() => setDeleteModal(review)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="rv-overlay" onClick={() => setDeleteModal(null)}>
          <div className="rv-modal rv-modal--sm" onClick={(e) => e.stopPropagation()}>
            <button className="rv-modal__close" onClick={() => setDeleteModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            <div className="rv-modal__header rv-modal__header--danger">
              <span className="rv-modal__icon"><FontAwesomeIcon icon={faTrash} /></span>
              <h3>Delete Review</h3>
              <p>Are you sure you want to delete your review for <strong>{deleteModal.item_name || `${deleteModal.item_type} #${deleteModal.item_id}`}</strong>? This cannot be undone.</p>
            </div>
            <div className="rv-modal__body">
              <div className="rv-modal__actions">
                <button className="rv-modal__cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="rv-modal__submit rv-modal__submit--danger" disabled={deleting} onClick={handleDelete}>
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="rv-overlay" onClick={() => setEditModal(null)}>
          <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rv-modal__close" onClick={() => setEditModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            <div className="rv-modal__header">
              <span className="rv-modal__icon"><FontAwesomeIcon icon={faPenToSquare} /></span>
              <h3>Edit Review</h3>
              <p>{editModal.item_name || `${editModal.item_type} #${editModal.item_id}`}</p>
            </div>
            <div className="rv-modal__body">
              {editMsg && (
                <div className={`rv-modal__msg ${editMsg.includes('!') ? 'rv-modal__msg--success' : 'rv-modal__msg--error'}`}>
                  {editMsg}
                </div>
              )}
              <div className="rv-modal__stars-section">
                <p className="rv-modal__stars-label">Your Rating</p>
                <div className="rv-modal__stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`rv-star ${s <= (hoverRating || editForm.rating) ? 'rv-star--active' : ''}`}
                      onClick={() => setEditForm({ ...editForm, rating: s })}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    >★</button>
                  ))}
                </div>
                <p className="rv-modal__rating-hint">{RATING_LABELS[hoverRating || editForm.rating]}</p>
              </div>
              <div className="rv-modal__comment">
                <label>Comment <span className="rv-modal__optional">(optional)</span></label>
                <textarea
                  rows="4"
                  value={editForm.comment}
                  placeholder="Share your experience…"
                  maxLength={500}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                />
                <span className="rv-modal__char-count">{editForm.comment.length}/500</span>
              </div>
              <div className="rv-modal__actions">
                <button className="rv-modal__cancel" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="rv-modal__submit" disabled={submitting} onClick={handleUpdate}>
                  {submitting ? 'Saving…' : 'Save Changes'}
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

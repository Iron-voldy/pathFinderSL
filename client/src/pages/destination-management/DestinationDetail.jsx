import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faStar, faEye } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/shared/Navbar';
import { destinationsAPI, lifestylesAPI, cartAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './DestinationDetail.css';

const CATEGORY_MAP = [
  { label: 'Adventure',      keywords: ['adventure', 'trek', 'trekking', 'hike', 'hiking', 'rafting', 'kayak', 'abseiling', 'climbing', 'zip line', 'zip-line', 'canyoning', 'balloon', 'ballooning', 'rappel', 'atv', 'ferrata', 'cycling'] },
  { label: 'Water Sports',   keywords: ['water sport', 'diving', 'snorkel', 'whale', 'boat', 'jet ski', 'surfing', 'surf ', 'fishing', 'paddle', 'catamaran', 'wakeboard', 'banana ride', 'speed boat', 'paramotoring', 'sup '] },
  { label: 'Wellness & Spa', keywords: ['massage', ' spa', 'ayurveda', 'wellness', 'yoga', 'retreat', 'meditation', 'therapy', 'shirodhara', 'steam', 'botox', 'filler', 'iv drip', 'consultation', 'detox', 'ayurvedic', 'scuba course', 'scuba diving course'] },
  { label: 'Beauty',         keywords: ['salon', 'hair cut', 'haircut', 'hair color', 'facial ', 'nail ', 'manicure', 'pedicure', 'makeup', 'henna', 'mehendi', 'waxing', 'threading', 'dermabrasion', 'cleanup', 'charcoal facial', 'glow facial', 'gold facial', 'chocolate facial', 'bleach', 'bridal'] },
  { label: 'Tours & Safaris',keywords: ['safari', 'village', 'elephant', 'golf', 'bird watch', 'birdwatch', 'wildlife', 'sightseeing', 'tea trail', 'tea trek', 'plantation', 'culture', 'heritage', 'folk', 'drone photo', 'catamaran tour'] },
  { label: 'Transport',      keywords: ['rent a ', 'rental', 'scooter', 'motorcycle', 'royal enfield', 'honda navi', 'honda dio', 'honda pcx', 'honda crf', 'yamaha ', 'aprilia', 'tvs n', 'suzuki'] },
  { label: 'Nightlife',      keywords: ['night club', 'nightclub', ' club', 'party'] },
];

function getActivityCategory(act) {
  const text = [
    act.lifestyle_name || '',
    act.lifestyle_attraction_type || '',
    act.selling_points || '',
  ].join(' ').toLowerCase();
  for (const { label, keywords } of CATEGORY_MAP) {
    if (keywords.some((kw) => text.includes(kw))) return label;
  }
  return 'Other';
}

const BADGE_COLORS = {
  'Adventure':      { bg: 'rgba(34,197,94,0.15)',  color: '#16a34a' },
  'Water Sports':   { bg: 'rgba(59,130,246,0.15)', color: '#2563eb' },
  'Wellness & Spa': { bg: 'rgba(168,85,247,0.15)', color: '#9333ea' },
  'Beauty':         { bg: 'rgba(236,72,153,0.15)', color: '#db2777' },
  'Tours & Safaris':{ bg: 'rgba(234,179,8,0.15)',  color: '#ca8a04' },
  'Transport':      { bg: 'rgba(20,184,166,0.15)', color: '#0d9488' },
  'Nightlife':      { bg: 'rgba(239,68,68,0.15)',  color: '#dc2626' },
  'Other':          { bg: 'rgba(233,169,60,0.15)', color: '#e9a93c' },
};

const CategoryBadge = ({ category }) => {
  if (!category) return null;
  const style = BADGE_COLORS[category] || BADGE_COLORS['Other'];
  return (
    <span className="act-badge" style={{ background: style.bg, color: style.color }}>
      {category}
    </span>
  );
};



const DestinationDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart modal state
  const [cartModal, setCartModal] = useState(null); // activity object or null
  const [cartForm, setCartForm] = useState({ event_date: '', adult_count: 1, child_count: 0 });
  const [carts, setCarts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState('');
  const [newCartName, setNewCartName] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Tomorrow's date as YYYY-MM-DD (minimum selectable date)
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Reviews per activity
  const [activityReviews, setActivityReviews] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter((a) => getActivityCategory(a) === activeCategory));
    }
  }, [activeCategory, activities]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [destRes, actRes] = await Promise.all([
        destinationsAPI.getById(id),
        lifestylesAPI.getByDestination(id, { limit: 200 }),
      ]);
      setDestination(destRes.data);
      setActivities(actRes.data || []);
    } catch {
      setError('Could not load destination details.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(
    new Set(activities.map(getActivityCategory))
  ).sort()];

  const fetchCarts = async () => {
    try {
      const res = await cartAPI.getCarts();
      setCarts(res.data || []);
      if (res.data.length > 0 && !selectedCartId) setSelectedCartId(String(res.data[0].id));
    } catch { /* ok */ }
  };

  const openCartModal = (act) => {
    setCartModal(act);
    setCartForm({ event_date: '', adult_count: 1, child_count: 0 });
    setCartSuccess('');
    setFormErrors({});
    if (isAuthenticated) fetchCarts();
  };

  const validateForm = () => {
    const errors = {};
    if (!cartForm.event_date) {
      errors.event_date = 'Please select a date.';
    } else if (cartForm.event_date < tomorrowStr) {
      errors.event_date = 'Date must be from tomorrow onwards.';
    }
    if (!cartForm.adult_count || cartForm.adult_count < 1) {
      errors.adult_count = 'At least 1 adult required.';
    }
    if (cartForm.child_count < 0) {
      errors.child_count = 'Cannot be negative.';
    }
    if (selectedCartId === 'new' && !newCartName.trim()) {
      errors.cart_name = 'Please enter a cart name.';
    }
    return errors;
  };

  const handleAddToCart = async () => {
    if (!cartModal) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setAddingToCart(true);
    try {
      let cartId = selectedCartId;
      if (cartId === 'new' || !cartId) {
        const res = await cartAPI.createCart({ cart_name: newCartName || 'My Cart' });
        cartId = res.data.id;
        setSelectedCartId(String(cartId));
      }
      await cartAPI.addItem(cartId, {
        item_type: 'lifestyle',
        item_id: cartModal.lifestyle_id,
        item_name: cartModal.lifestyle_name,
        item_image: cartModal.image || '',
        event_date: cartForm.event_date,
        adult_count: cartForm.adult_count,
        child_count: cartForm.child_count,
        unit_price: parseFloat(cartModal.adult_rate) || 0,
        currency: cartModal.currency || 'LKR',
      });
      setCartSuccess('Added to cart!');
      setTimeout(() => { setCartModal(null); setCartSuccess(''); }, 1500);
    } catch { setCartSuccess('Failed to add.'); }
    finally { setAddingToCart(false); }
  };

  // Fetch reviews for displayed activities
  useEffect(() => {
    filteredActivities.forEach(async (act) => {
      if (activityReviews[act.lifestyle_id] !== undefined) return;
      try {
        const res = await reviewsAPI.getItemReviews('lifestyle', act.lifestyle_id);
        setActivityReviews((prev) => ({ ...prev, [act.lifestyle_id]: res.data }));
      } catch {
        setActivityReviews((prev) => ({ ...prev, [act.lifestyle_id]: { avgRating: 0, count: 0 } }));
      }
    });
  }, [filteredActivities]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dest-detail-loader">
          <div className="dest-detail-loader__spinner" />
          <p>Loading destination…</p>
        </div>
      </>
    );
  }

  if (error || !destination) {
    return (
      <>
        <Navbar />
        <div className="dest-detail-error">
          <p>{error || 'Destination not found.'}</p>
          <Link to="/destinations" className="dest-detail-back">← Back to destinations</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dest-detail">

        {/* ── Left panel ─────────────────────────── */}
        <aside className="dest-detail__left">
          {/* Full-size sharp image */}
          {destination.image_url ? (
            <img
              src={destination.image_url}
              alt={destination.name}
              className="dest-detail__cover-img"
            />
          ) : (
            <div className="dest-detail__bg" />
          )}
          {/* Dark-to-transparent overlay at the bottom for text legibility */}
          <div className="dest-detail__overlay" />
          {/* Right-edge fade that bleeds into the right panel */}
          <div className="dest-detail__fade-right" />

          {/* Content */}
          <div className="dest-detail__info">
            <Link to="/destinations" className="dest-detail__back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
              All Destinations
            </Link>

            {destination.region ? (
              <span className="dest-detail__region">{destination.region}</span>
            ) : null}

            <h1 className="dest-detail__name">{destination.name}</h1>

            {destination.tagline ? (
              <p className="dest-detail__tagline">{destination.tagline}</p>
            ) : null}

            {destination.description ? (
              <p className="dest-detail__desc">{destination.description}</p>
            ) : null}

            <div className="dest-detail__stats">
              <div className="dest-detail__stat">
                <span className="dest-detail__stat-number">{activities.length}</span>
                <span className="dest-detail__stat-label">Activities</span>
              </div>
              {destination.region ? (
                <div className="dest-detail__stat">
                  <span className="dest-detail__stat-number">{destination.region}</span>
                  <span className="dest-detail__stat-label">Region</span>
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        {/* ── Right panel ────────────────────────── */}
        <main className="dest-detail__right">
          <div className="dest-detail__right-inner">

            <div className="dest-detail__right-header">
              <h2>Activities & Lifestyle</h2>
              <p>{filteredActivities.length} experience{filteredActivities.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Category filter */}
            {categories.length > 1 ? (
              <div className="dest-detail__filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`dest-detail__filter-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Activity grid */}
            {filteredActivities.length === 0 ? (
              <div className="dest-detail__empty">
                <p>No activities found{activeCategory !== 'all' ? ` for "${activeCategory}"` : ''} in this destination yet.</p>
              </div>
            ) : (
              <div className="act-grid">
                {filteredActivities.map((act) => (
                  <div key={act.lifestyle_id} className="act-card">
                    {act.image && (
                      <div className="act-card__image-wrap">
                        <img
                          src={act.image}
                          alt={act.lifestyle_name}
                          className="act-card__image"
                          onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        />
                        <CategoryBadge category={getActivityCategory(act)} />
                      </div>
                    )}
                    {!act.image && (
                      <div className="act-card__badge-only">
                        <CategoryBadge category={getActivityCategory(act)} />
                      </div>
                    )}
                    <div className="act-card__body">
                      <h3 className="act-card__title">{act.lifestyle_name}</h3>
                      {(act.sub_description || act.lifestyle_description) ? (
                        <p className="act-card__desc">{act.sub_description || act.lifestyle_description}</p>
                      ) : null}
                      {activityReviews[act.lifestyle_id] && activityReviews[act.lifestyle_id].count > 0 && (
                        <div className="act-card__review-row">
                          <span className="act-card__stars">
                            {[1,2,3,4,5].map((s) => (
                              <FontAwesomeIcon key={s} icon={faStar}
                                style={{ color: s <= Math.round(activityReviews[act.lifestyle_id].avgRating) ? '#f59e0b' : '#e2e8f0' }} />
                            ))}
                          </span>
                          <span className="act-card__review-count">({activityReviews[act.lifestyle_id].count})</span>
                        </div>
                      )}
                      {act.adult_rate && parseFloat(act.adult_rate) > 0 ? (
                        <div className="act-card__price">
                          <span className="act-card__price-label">From</span>
                          <span className="act-card__price-value">
                            {act.currency || 'LKR'} {parseFloat(act.adult_rate).toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                      <div className="act-card__actions">
                        <Link to={`/lifestyle/${act.lifestyle_id}`} className="act-card__view-btn">
                          <FontAwesomeIcon icon={faEye} /> View Details
                        </Link>
                        <button className="act-card__cart-btn" onClick={() => openCartModal(act)}>
                          <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                        </button>
                      </div>
                      {(act.lifestyle_city || act.address || act.latitude) ? (
                        <div className="act-card__location">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.553C15.271 15.36 17 13.28 17 10c0-3.866-3.134-7-7-7S3 6.134 3 10c0 3.28 1.73 5.36 3.354 6.797a12.5 12.5 0 0 0 2.757 1.553 7.044 7.044 0 0 0 .281.14l.018.008.006.003ZM10 11.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" clipRule="evenodd" />
                          </svg>
                          <span>{act.address || act.lifestyle_city || (act.latitude && act.longitude ? `${parseFloat(act.latitude).toFixed(4)}, ${parseFloat(act.longitude).toFixed(4)}` : '')}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>

        {/* Cart modal */}
        {cartModal && (
          <div className="act-cart-overlay" onClick={() => setCartModal(null)}>
            <div className="act-cart-modal" onClick={(e) => e.stopPropagation()}>
              <h3><FontAwesomeIcon icon={faCartShopping} /> Add to Cart</h3>
              <p className="act-cart-modal__name">{cartModal.lifestyle_name}</p>
              {cartSuccess && <div className="act-cart-modal__msg">{cartSuccess}</div>}
              {!isAuthenticated ? (
                <div className="act-cart-modal__login">
                  <p>Please log in to add items to your cart.</p>
                  <Link to="/userlogin" className="act-cart-modal__btn">Log In</Link>
                </div>
              ) : (
                <>
                  <label>Date *
                    <input
                      type="date"
                      value={cartForm.event_date}
                      min={tomorrowStr}
                      className={formErrors.event_date ? 'input-error' : ''}
                      onChange={(e) => {
                        setCartForm({ ...cartForm, event_date: e.target.value });
                        if (formErrors.event_date) setFormErrors((prev) => ({ ...prev, event_date: '' }));
                      }}
                    />
                    {formErrors.event_date && <span className="act-cart-modal__field-error">{formErrors.event_date}</span>}
                  </label>
                  <div className="act-cart-modal__row">
                    <label>Adults
                      <input
                        type="number"
                        min="1"
                        value={cartForm.adult_count}
                        className={formErrors.adult_count ? 'input-error' : ''}
                        onChange={(e) => {
                          setCartForm({ ...cartForm, adult_count: parseInt(e.target.value) || 1 });
                          if (formErrors.adult_count) setFormErrors((prev) => ({ ...prev, adult_count: '' }));
                        }}
                      />
                      {formErrors.adult_count && <span className="act-cart-modal__field-error">{formErrors.adult_count}</span>}
                    </label>
                    <label>Children
                      <input
                        type="number"
                        min="0"
                        value={cartForm.child_count}
                        className={formErrors.child_count ? 'input-error' : ''}
                        onChange={(e) => {
                          setCartForm({ ...cartForm, child_count: parseInt(e.target.value) || 0 });
                          if (formErrors.child_count) setFormErrors((prev) => ({ ...prev, child_count: '' }));
                        }}
                      />
                      {formErrors.child_count && <span className="act-cart-modal__field-error">{formErrors.child_count}</span>}
                    </label>
                  </div>
                  <label>Add to Cart
                    <select value={selectedCartId} onChange={(e) => setSelectedCartId(e.target.value)}>
                      {carts.map((c) => <option key={c.id} value={c.id}>{c.cart_name}</option>)}
                      <option value="new">+ New Cart</option>
                    </select>
                  </label>
                  {selectedCartId === 'new' && (
                    <>
                      <input
                        className={`act-cart-modal__newname${formErrors.cart_name ? ' input-error' : ''}`}
                        placeholder="Cart name…"
                        value={newCartName}
                        onChange={(e) => {
                          setNewCartName(e.target.value);
                          if (formErrors.cart_name) setFormErrors((prev) => ({ ...prev, cart_name: '' }));
                        }}
                      />
                      {formErrors.cart_name && <span className="act-cart-modal__field-error">{formErrors.cart_name}</span>}
                    </>
                  )}
                  <div className="act-cart-modal__actions">
                    <button className="act-cart-modal__btn" disabled={addingToCart}
                      onClick={handleAddToCart}>{addingToCart ? 'Adding…' : 'Add to Cart'}</button>
                    <button className="act-cart-modal__cancel" onClick={() => setCartModal(null)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default DestinationDetail;

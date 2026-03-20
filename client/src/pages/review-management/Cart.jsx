import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { cartAPI, ordersAPI } from '../../services/api';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCartId, setActiveCartId] = useState(null);
  const [activeCart, setActiveCart] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [creatingCart, setCreatingCart] = useState(false);
  const [newCartName, setNewCartName] = useState('');

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cartAPI.getCarts();
      const list = res.data || [];
      setCarts(list);
      if (list.length > 0 && !activeCartId) {
        setActiveCartId(list[0].id);
      }
    } catch { setError('Failed to load carts.'); }
    finally { setLoading(false); }
  }, [activeCartId]);

  const fetchActiveCart = useCallback(async () => {
    if (!activeCartId) { setActiveCart(null); return; }
    try {
      const res = await cartAPI.getCart(activeCartId);
      setActiveCart(res.data);
    } catch { setActiveCart(null); }
  }, [activeCartId]);

  useEffect(() => { fetchCarts(); }, []);
  useEffect(() => { fetchActiveCart(); }, [activeCartId, fetchActiveCart]);

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return;
    try {
      const res = await cartAPI.createCart({ cart_name: newCartName.trim() });
      setNewCartName('');
      setCreatingCart(false);
      setActiveCartId(res.data.id);
      await fetchCarts();
    } catch { setError('Failed to create cart.'); }
  };

  const handleDeleteItem = async (itemId) => {
    setDeletingId(itemId);
    try {
      await cartAPI.deleteItem(itemId);
      await fetchActiveCart();
    } catch { setError('Failed to remove item.'); }
    finally { setDeletingId(null); }
  };

  const handleDeleteCart = async (cartId) => {
    try {
      await cartAPI.deleteCart(cartId);
      if (activeCartId === cartId) setActiveCartId(null);
      await fetchCarts();
    } catch { setError('Failed to delete cart.'); }
  };

  const handleCheckout = async () => {
    if (!activeCart || !activeCart.items || activeCart.items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await ordersAPI.checkout(activeCart.id, {});
      if (res.whatsapp_url) {
        window.open(res.whatsapp_url, '_blank');
      }
      navigate('/orders');
    } catch { setError('Checkout failed.'); }
    finally { setCheckingOut(false); }
  };

  const items = activeCart?.items || [];
  const total = items.reduce((s, i) => s + parseFloat(i.unit_price || 0), 0);
  const currency = items[0]?.currency || 'LKR';

  if (loading) return (
    <><Navbar />
      <div className="cart-page"><div className="cart-loading"><div className="cart-spinner" /><p>Loading your cart…</p></div></div>
      <Footer /></>
  );

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-container">

          {/* Header */}
          <div className="cart-header">
            <div>
              <h1>Shopping Cart</h1>
              <p>{carts.length} cart{carts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {error && (
            <div className="cart-alert">{error} <button onClick={() => setError('')}>✕</button></div>
          )}

          {/* Cart selector */}
          <div className="cart-tabs">
            {carts.map((c) => (
              <button
                key={c.id}
                className={'cart-tab' + (activeCartId === c.id ? ' active' : '')}
                onClick={() => setActiveCartId(c.id)}
              >
                {c.cart_name}
                <span className="cart-tab__count">{(c.items || []).length}</span>
              </button>
            ))}
            {!creatingCart ? (
              <button className="cart-tab cart-tab--new" onClick={() => setCreatingCart(true)}>+ New Cart</button>
            ) : (
              <div className="cart-new-form">
                <input
                  value={newCartName}
                  onChange={(e) => setNewCartName(e.target.value)}
                  placeholder="Cart name…"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCart()}
                />
                <button onClick={handleCreateCart}>Create</button>
                <button onClick={() => { setCreatingCart(false); setNewCartName(''); }}>✕</button>
              </div>
            )}
          </div>

          {/* Cart content */}
          {!activeCart || items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛍️</div>
              <h2 className="cart-empty__title">Your cart is empty</h2>
              <p className="cart-empty__desc">Start building your perfect Sri Lanka trip.</p>
              <div className="cart-empty__links">
                <Link to="/hotels" className="cart-empty__link">Browse Hotels</Link>
                <Link to="/destinations" className="cart-empty__link">Explore Destinations</Link>
              </div>
            </div>
          ) : (
            <div className="cart-body">
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.item_image || 'https://via.placeholder.com/100'} alt={item.item_name} className="cart-item__image" />
                    <div className="cart-item__info">
                      <span className={'cart-item__type'}>
                        {item.item_type === 'hotel' ? 'Hotel' : 'Activity'}
                      </span>
                      <h3 className="cart-item__name">{item.item_name}</h3>
                      <div className="cart-item__details">
                        {item.item_type === 'hotel' && item.check_in && (
                          <span><span className="cart-item__detail-label">Dates:</span> {item.check_in} → {item.check_out || '?'}</span>
                        )}
                        {item.item_type === 'lifestyle' && item.event_date && (
                          <span><span className="cart-item__detail-label">Date:</span> {item.event_date}</span>
                        )}
                        <span><span className="cart-item__detail-label">Guests:</span> {item.adult_count} adult{item.adult_count !== 1 ? 's' : ''}{item.child_count > 0 ? `, ${item.child_count} child${item.child_count !== 1 ? 'ren' : ''}` : ''}</span>
                      </div>
                    </div>
                    <div className="cart-item__actions">
                      <div className="cart-item__price">{item.currency} {parseFloat(item.unit_price).toLocaleString()}</div>
                      <button
                        className="cart-item__review-btn"
                        onClick={() => navigate(`/${item.item_type === 'hotel' ? 'hotels' : 'destinations'}/${item.item_id}`)}
                      >
                        View
                      </button>
                      <button
                        className="cart-item__delete-btn"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        {deletingId === item.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout sidebar */}
              <div className="cart-summary">
                <h3>
                  Order Summary
                  <span className="cart-summary__count">{items.length}</span>
                </h3>
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <strong>{currency} {total.toLocaleString()}</strong>
                </div>
                <div className="cart-summary__total">
                  <span>Total</span>
                  <strong>{currency} {total.toLocaleString()}</strong>
                </div>
                <button
                  className="cart-checkout-btn"
                  disabled={checkingOut || items.length === 0}
                  onClick={handleCheckout}
                >
                  {checkingOut ? 'Processing…' : 'Complete Booking via WhatsApp'}
                </button>
                <p className="cart-checkout-note">
                  You'll be redirected to WhatsApp to confirm your booking details with our team.
                </p>
                <button
                  className="cart-delete-btn"
                  onClick={() => handleDeleteCart(activeCart.id)}
                >
                  Delete This Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

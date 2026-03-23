import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faClock, faCircleCheck, faCircleXmark,
  faWallet, faHotel, faMountainSun, faSearch, faAngleLeft,
  faUser, faEnvelope, faCalendarDays, faUserGroup, faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { ordersAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminOrders.css';

const STATUS_META = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7', icon: faClock },
  confirmed: { label: 'Confirmed', color: '#16a34a', bg: '#dcfce7', icon: faCircleCheck },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', icon: faCircleXmark },
};

const STAT_CARDS = [
  { key: 'totalOrders', label: 'Total Orders', icon: faClipboardList, accent: '#3b82f6' },
  { key: 'pending',     label: 'Pending',      icon: faClock,         accent: '#d97706' },
  { key: 'confirmed',   label: 'Confirmed',    icon: faCircleCheck,   accent: '#16a34a' },
  { key: 'cancelled',   label: 'Cancelled',    icon: faCircleXmark,   accent: '#dc2626' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordRes, statRes] = await Promise.all([
        ordersAPI.adminGetOrders(),
        ordersAPI.adminGetStats(),
      ]);
      setOrders(ordRes.data || []);
      setStats(statRes.data || null);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await ordersAPI.adminUpdateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      const statRes = await ordersAPI.adminGetStats();
      setStats(statRes.data || null);
    } catch {
      setError('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.user?.full_name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Orders Management">
      <div className="ao-page">
        <div className="ao-container">
          <div className="ao-header">
            <div>
              <h1 className="ao-title">Orders Management</h1>
              <p className="ao-subtitle">View and manage all customer orders</p>
            </div>
            <Link to="/admin/dev/hotels" className="ao-back-btn">
              <FontAwesomeIcon icon={faAngleLeft} /> Admin Panel
            </Link>
          </div>

          {error && <div className="ao-alert">{error}</div>}

          {/* Stats */}
          {stats && (
            <div className="ao-stats-grid">
              {STAT_CARDS.map((c) => (
                <div className="ao-stat-card" key={c.key} style={{ '--ao-accent': c.accent }}>
                  <span className="ao-stat-icon">
                    <FontAwesomeIcon icon={c.icon} />
                  </span>
                  <div>
                    <p className="ao-stat-num">{stats[c.key]}</p>
                    <p className="ao-stat-label">{c.label}</p>
                  </div>
                </div>
              ))}
              <div className="ao-stat-card ao-stat-card--revenue" style={{ '--ao-accent': '#0c618a' }}>
                <span className="ao-stat-icon">
                  <FontAwesomeIcon icon={faWallet} />
                </span>
                <div>
                  <p className="ao-stat-num">LKR {parseFloat(stats.revenue || 0).toLocaleString()}</p>
                  <p className="ao-stat-label">Revenue (Confirmed)</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="ao-filters">
            <div className="ao-search-wrap">
              <FontAwesomeIcon icon={faSearch} className="ao-search-icon" />
              <input
                className="ao-search"
                type="text"
                placeholder="Search by order number, name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ao-status-tabs">
              {['all', 'pending', 'confirmed', 'cancelled'].map((s) => {
                const meta = STATUS_META[s];
                return (
                  <button
                    key={s}
                    className={`ao-status-tab ${statusFilter === s ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                    style={statusFilter === s && meta ? { background: meta.color, borderColor: meta.color } : undefined}
                  >
                    {meta && <FontAwesomeIcon icon={meta.icon} className="ao-tab-icon" />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="ao-loading"><div className="ao-spinner" /> Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="ao-empty">
              <FontAwesomeIcon icon={faClipboardList} className="ao-empty-icon" />
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="ao-orders-list">
              {filtered.map((order) => {
                const sm = STATUS_META[order.status] || STATUS_META.pending;
                return (
                  <div className="ao-card" key={order.id}>
                    <div className="ao-card__header">
                      <div className="ao-card__left">
                        <span className="ao-card__number">{order.order_number}</span>
                        <span className="ao-card__date">
                          <FontAwesomeIcon icon={faCalendarDays} />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="ao-card__right">
                        <span className="ao-status-badge" style={{ background: sm.bg, color: sm.color, borderColor: sm.color }}>
                          <FontAwesomeIcon icon={sm.icon} />
                          {sm.label}
                        </span>
                        <select
                          className="ao-status-select"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="ao-card__user">
                      <span className="ao-card__user-name">
                        <FontAwesomeIcon icon={faUser} />
                        {order.user?.full_name || order.customer_name || '--'}
                      </span>
                      <span className="ao-card__user-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {order.user?.email || order.customer_email || ''}
                      </span>
                    </div>

                    <div className="ao-card__items">
                      {(order.items || []).map((item) => (
                        <div className="ao-item" key={item.id}>
                          <div className="ao-item__img">
                            {item.item_image ? (
                              <img src={item.item_image} alt={item.item_name} />
                            ) : (
                              <FontAwesomeIcon
                                icon={item.item_type === 'hotel' ? faHotel : faMountainSun}
                                className="ao-item__fallback-icon"
                              />
                            )}
                          </div>
                          <div className="ao-item__info">
                            <strong>{item.item_name}</strong>
                            <div className="ao-item__meta">
                              <span className="ao-item__type">{item.item_type}</span>
                              {item.check_in && (
                                <span className="ao-item__dates">
                                  <FontAwesomeIcon icon={faCalendarDays} />
                                  {item.check_in}
                                  <FontAwesomeIcon icon={faArrowRight} className="ao-date-arrow" />
                                  {item.check_out || '?'}
                                </span>
                              )}
                              {item.event_date && (
                                <span className="ao-item__dates">
                                  <FontAwesomeIcon icon={faCalendarDays} /> {item.event_date}
                                </span>
                              )}
                              <span className="ao-item__guests">
                                <FontAwesomeIcon icon={faUserGroup} />
                                {item.adult_count}A {item.child_count > 0 ? `+ ${item.child_count}C` : ''}
                              </span>
                            </div>
                          </div>
                          <div className="ao-item__price">
                            {item.currency} {parseFloat(item.unit_price).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="ao-card__footer">
                      <span className="ao-card__footer-label">Order Total</span>
                      <strong>{order.currency} {parseFloat(order.total_amount).toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

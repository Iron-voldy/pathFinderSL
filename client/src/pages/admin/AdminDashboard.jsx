import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHotel, faMap, faMountainSun, faWallet, faClipboardList,
  faChartBar, faArrowTrendUp, faCircleCheck,
  faClock, faXmark, faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { hotelsAPI, destinationsAPI, lifestylesAPI, ordersAPI, budgetAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';

function StatCard({ icon, label, value, sub, color, to }) {
  const inner = (
    <div className={`adm-stat-card adm-stat-card--${color}`}>
      <div className="adm-stat-card__icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="adm-stat-card__body">
        <div className="adm-stat-card__value">{value ?? '—'}</div>
        <div className="adm-stat-card__label">{label}</div>
        {sub && <div className="adm-stat-card__sub">{sub}</div>}
      </div>
      {to && <FontAwesomeIcon icon={faAngleRight} className="adm-stat-card__arrow" />}
    </div>
  );
  return to ? <Link to={to} className="adm-stat-card__link">{inner}</Link> : inner;
}

function QuickLink({ to, icon, label, desc, color }) {
  return (
    <Link to={to} className={`adm-quick-link adm-quick-link--${color}`}>
      <FontAwesomeIcon icon={icon} className="adm-quick-link__icon" />
      <div>
        <div className="adm-quick-link__label">{label}</div>
        <div className="adm-quick-link__desc">{desc}</div>
      </div>
      <FontAwesomeIcon icon={faAngleRight} className="adm-quick-link__arrow" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    hotels: null, destinations: null, lifestyles: null,
    orders: null, budgets: null,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      hotelsAPI.getAll({ limit: 1 }),
      destinationsAPI.getAll({ limit: 1 }),
      lifestylesAPI.getAll({ limit: 1 }),
      ordersAPI.adminGetStats(),
      budgetAPI.adminGetStats(),
      ordersAPI.adminGetOrders(),
    ]);

    const [hotels, dests, lives, orderStats, budgetStats, orders] = results;

    setStats({
      hotels: hotels.status === 'fulfilled' ? hotels.value.pagination?.totalItems ?? hotels.value.data?.length : null,
      destinations: dests.status === 'fulfilled' ? dests.value.pagination?.totalItems ?? dests.value.data?.length : null,
      lifestyles: lives.status === 'fulfilled' ? lives.value.pagination?.totalItems ?? lives.value.data?.length : null,
      orders: orderStats.status === 'fulfilled' ? orderStats.value.data : null,
      budgets: budgetStats.status === 'fulfilled' ? budgetStats.value.data : null,
    });

    if (orders.status === 'fulfilled') {
      const list = orders.value.data || [];
      setRecentOrders(list.slice(0, 6));
    }

    setLoading(false);
  };

  const statusIcon = (s) => {
    if (s === 'confirmed') return <span className="adm-status adm-status--confirmed"><FontAwesomeIcon icon={faCircleCheck} /> Confirmed</span>;
    if (s === 'pending') return <span className="adm-status adm-status--pending"><FontAwesomeIcon icon={faClock} /> Pending</span>;
    if (s === 'cancelled') return <span className="adm-status adm-status--cancelled"><FontAwesomeIcon icon={faXmark} /> Cancelled</span>;
    return <span className="adm-status">{s}</span>;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="adm-content">
          {/* Stats row */}
          <div className="adm-stats-row">
            <StatCard icon={faHotel} label="Total Hotels" value={loading ? '...' : stats.hotels}
              color="blue" to="/admin/dev/hotels" />
            <StatCard icon={faMap} label="Destinations" value={loading ? '...' : stats.destinations}
              color="teal" to="/admin/dev/destinations" />
            <StatCard icon={faMountainSun} label="Activities" value={loading ? '...' : stats.lifestyles}
              color="green" to="/admin/dev/lifestyles" />
            <StatCard icon={faClipboardList} label="Total Orders"
              value={loading ? '...' : (stats.orders?.total ?? stats.orders?.totalOrders ?? '—')}
              sub={stats.orders ? `${stats.orders.confirmed ?? stats.orders.confirmedOrders ?? 0} confirmed` : null}
              color="purple" to="/admin/dev/orders" />
            <StatCard icon={faWallet} label="Budget Plans"
              value={loading ? '...' : (stats.budgets?.totalPlans ?? '—')}
              color="orange" to="/admin/dev/budget" />
          </div>

          <div className="adm-row">
            {/* Quick links */}
            <section className="adm-panel adm-panel--links">
              <h2 className="adm-panel__title">
                <FontAwesomeIcon icon={faArrowTrendUp} /> Quick Actions
              </h2>
              <div className="adm-quick-links">
                <QuickLink to="/admin/dev/hotels/add" icon={faHotel} color="blue"
                  label="Add Hotel" desc="Create a new hotel listing" />
                <QuickLink to="/admin/dev/destinations/add" icon={faMap} color="teal"
                  label="Add Destination" desc="Add a new destination" />
                <QuickLink to="/admin/dev/lifestyles/add" icon={faMountainSun} color="green"
                  label="Add Activity" desc="Create an activity or lifestyle item" />
                <QuickLink to="/admin/dev/hotels" icon={faChartBar} color="indigo"
                  label="Manage Hotels" desc="View, edit or remove hotels" />
                <QuickLink to="/admin/dev/destinations" icon={faMap} color="cyan"
                  label="Manage Destinations" desc="Manage all destinations" />
                <QuickLink to="/admin/dev/lifestyles" icon={faMountainSun} color="emerald"
                  label="Manage Activities" desc="Edit lifestyle & activity items" />
                <QuickLink to="/admin/dev/orders" icon={faClipboardList} color="purple"
                  label="Manage Orders" desc="Review and update order statuses" />
                <QuickLink to="/admin/dev/budget" icon={faWallet} color="orange"
                  label="Manage Budgets" desc="View customer budget plans" />
              </div>
            </section>

            {/* Recent orders */}
            <section className="adm-panel adm-panel--orders">
              <div className="adm-panel__head">
                <h2 className="adm-panel__title">
                  <FontAwesomeIcon icon={faClipboardList} /> Recent Orders
                </h2>
                <Link to="/admin/dev/orders" className="adm-panel__see-all">
                  See all <FontAwesomeIcon icon={faAngleRight} />
                </Link>
              </div>
              {loading ? (
                <div className="adm-loading">Loading...</div>
              ) : recentOrders.length === 0 ? (
                <div className="adm-empty">No orders yet.</div>
              ) : (
                <div className="adm-orders-table-wrap">
                  <table className="adm-orders-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="adm-order-id">#{o.id}</td>
                          <td>{o.user?.full_name || o.customer_name || '—'}</td>
                          <td className="adm-order-amount">
                            {o.currency || 'LKR'} {parseFloat(o.total_amount || 0).toLocaleString()}
                          </td>
                          <td>{statusIcon(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
      </div>
    </AdminLayout>
  );
}

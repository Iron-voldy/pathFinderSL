import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminBudgets.css';

const STATUS_META = {
  planning: { label: 'Planning', color: '#3b82f6' },
  active: { label: 'Active', color: '#10b981' },
  completed: { label: 'Completed', color: '#6366f1' },
};

export default function AdminBudgets() {
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [plansRes, statsRes] = await Promise.all([
        budgetAPI.adminGetPlans(),
        budgetAPI.adminGetStats(),
      ]);
      setPlans(plansRes.data || []);
      setStats(statsRes.data || null);
    } catch {
      setError('Failed to load budget data.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = plans.filter((p) => {
    const matchSearch =
      !search ||
      p.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.destination?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Budget Plans">
      <div className="ab-page">
        <div className="ab-container">
          {/* Header */}
          <div className="ab-header">
            <div>
              <h1 className="ab-title">Budget Plans Overview</h1>
              <p className="ab-subtitle">All user travel budget plans</p>
            </div>
            <Link to="/admin/dev" className="ab-back-btn">← Admin Panel</Link>
          </div>

          {error && <div className="ab-alert">{error}</div>}

          {/* Stats */}
          {stats && (
            <div className="ab-stats-grid">
              <div className="ab-stat-card">
                <span className="ab-stat-icon">📋</span>
                <div>
                  <p className="ab-stat-num">{stats.totalPlans}</p>
                  <p className="ab-stat-label">Total Plans</p>
                </div>
              </div>
              <div className="ab-stat-card">
                <span className="ab-stat-icon">🟡</span>
                <div>
                  <p className="ab-stat-num">{stats.byStatus?.planning || 0}</p>
                  <p className="ab-stat-label">Planning</p>
                </div>
              </div>
              <div className="ab-stat-card">
                <span className="ab-stat-icon">🟢</span>
                <div>
                  <p className="ab-stat-num">{stats.byStatus?.active || 0}</p>
                  <p className="ab-stat-label">Active</p>
                </div>
              </div>
              <div className="ab-stat-card">
                <span className="ab-stat-icon">🏁</span>
                <div>
                  <p className="ab-stat-num">{stats.byStatus?.completed || 0}</p>
                  <p className="ab-stat-label">Completed</p>
                </div>
              </div>
              <div className="ab-stat-card">
                <span className="ab-stat-icon">💰</span>
                <div>
                  <p className="ab-stat-num">
                    LKR {parseFloat(stats.totalBudgetValue || 0).toLocaleString()}
                  </p>
                  <p className="ab-stat-label">Total Budget Value</p>
                </div>
              </div>
              <div className="ab-stat-card">
                <span className="ab-stat-icon">💸</span>
                <div>
                  <p className="ab-stat-num">
                    LKR {parseFloat(stats.totalSpent || 0).toLocaleString()}
                  </p>
                  <p className="ab-stat-label">Total Spent</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="ab-filters">
            <input
              className="ab-search"
              type="text"
              placeholder="Search by plan, destination or user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="ab-status-tabs">
              {['all', 'planning', 'active', 'completed'].map((s) => (
                <button
                  key={s}
                  className={`ab-status-tab ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="ab-loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="ab-empty">No budget plans found.</div>
          ) : (
            <div className="ab-table-wrap">
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>User</th>
                    <th>Destination</th>
                    <th>Dates</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Items</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((plan) => {
                    const budget = parseFloat(plan.total_budget || 0);
                    const spent = parseFloat(plan.total_actual || 0);
                    const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
                    const over = spent > budget && budget > 0;
                    const sm = STATUS_META[plan.status] || STATUS_META.planning;

                    return (
                      <tr key={plan.id}>
                        <td>
                          <span className="ab-plan-name">{plan.plan_name}</span>
                          <span className="ab-plan-id">#{plan.id}</span>
                        </td>
                        <td>
                          <span className="ab-user-name">{plan.user?.full_name || '—'}</span>
                          <span className="ab-user-email">{plan.user?.email || ''}</span>
                        </td>
                        <td>{plan.destination || <span className="ab-na">—</span>}</td>
                        <td>
                          {plan.start_date ? (
                            <span className="ab-dates">
                              {plan.start_date}
                              <br />
                              {plan.end_date || '?'}
                            </span>
                          ) : (
                            <span className="ab-na">—</span>
                          )}
                        </td>
                        <td className="ab-num">
                          {plan.currency} {budget.toLocaleString()}
                        </td>
                        <td>
                          <div className="ab-spent-cell">
                            <span className={`ab-spent-val ${over ? 'over' : ''}`}>
                              {plan.currency} {spent.toLocaleString()}
                            </span>
                            <div className="ab-mini-progress">
                              <div
                                className={`ab-mini-bar ${over ? 'over' : ''}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="ab-num">{plan.item_count || 0}</td>
                        <td>
                          <span
                            className="ab-status-badge"
                            style={{ background: `${sm.color}18`, color: sm.color }}
                          >
                            {sm.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

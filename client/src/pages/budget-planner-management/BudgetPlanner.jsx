import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { budgetAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './BudgetPlanner.css';

const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'SGD', 'INR'];

const STATUS_META = {
  planning: { label: 'Planning', color: '#3b82f6' },
  active: { label: 'Active', color: '#10b981' },
  completed: { label: 'Completed', color: '#6366f1' },
};

const CATEGORY_ICONS = {
  accommodation: '🏨',
  transport: '✈️',
  food: '🍽️',
  activities: '🎭',
  shopping: '🛍️',
  miscellaneous: '📦',
};

const empty = {
  plan_name: '',
  destination: '',
  start_date: '',
  end_date: '',
  adult_count: 2,
  child_count: 0,
  total_budget: '',
  currency: 'LKR',
  notes: '',
  status: 'planning',
};

export default function BudgetPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // plan being edited
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getPlans();
      setPlans(res.data || []);
    } catch {
      setError('Failed to load budget plans.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setFormErrors({});
    setForm({
      plan_name: plan.plan_name || '',
      destination: plan.destination || '',
      start_date: plan.start_date || '',
      end_date: plan.end_date || '',
      adult_count: plan.adult_count ?? 2,
      child_count: plan.child_count ?? 0,
      total_budget: plan.total_budget || '',
      currency: plan.currency || 'LKR',
      notes: plan.notes || '',
      status: plan.status || 'planning',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.plan_name.trim()) {
      errors.plan_name = 'Plan name is required.';
    }
    if (!form.start_date) {
      errors.start_date = 'Start date is required.';
    }
    if (!form.end_date) {
      errors.end_date = 'End date is required.';
    } else if (form.start_date && form.end_date <= form.start_date) {
      errors.end_date = 'End date must be after start date.';
    }
    if (!form.total_budget || parseFloat(form.total_budget) <= 0) {
      errors.total_budget = 'Please enter a budget greater than 0.';
    }
    if (!form.adult_count || parseInt(form.adult_count) < 1) {
      errors.adult_count = 'At least 1 adult required.';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      if (editing) {
        await budgetAPI.updatePlan(editing.id, form);
        setShowModal(false);
        fetchPlans();
      } else {
        const res = await budgetAPI.createPlan(form);
        const newId = res.data?.id;
        setShowModal(false);
        if (newId) {
          navigate(`/budget/${newId}`);
        } else {
          fetchPlans();
        }
      }
    } catch {
      setError('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget plan and all its items?')) return;
    setDeletingId(id);
    try {
      await budgetAPI.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Failed to delete plan.');
    } finally {
      setDeletingId(null);
    }
  };

  const pct = (spent, budget) => {
    if (!budget || budget <= 0) return 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  };

  return (
    <>
      <Navbar />
      <div className="bp-page">
        {/* Hero */}
        <section className="bp-hero">
          <div className="bp-hero__content">
            <span className="bp-hero__eyebrow">Travel Smart</span>
            <h1 className="bp-hero__title">Budget Planner</h1>
            <p className="bp-hero__sub">
              Plan, track, and manage your Sri Lanka travel expenses — all in one place.
            </p>
            <button className="bp-hero__btn" onClick={openCreate}>
              + Create New Plan
            </button>
          </div>
        </section>

        {/* Plans */}
        <section className="bp-section">
          <div className="bp-container">
            {error && <div className="bp-alert">{error}</div>}

            {loading ? (
              <div className="bp-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bp-skeleton" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="bp-empty">
                <div className="bp-empty__icon">💰</div>
                <h3>No budget plans yet</h3>
                <p>Create your first travel budget plan to start tracking expenses.</p>
                <button className="bp-btn-primary" onClick={openCreate}>
                  Create First Plan
                </button>
              </div>
            ) : (
              <>
                <div className="bp-grid-header">
                  <h2>{plans.length} Budget Plan{plans.length !== 1 ? 's' : ''}</h2>
                  <button className="bp-btn-primary" onClick={openCreate}>
                    + New Plan
                  </button>
                </div>
                <div className="bp-grid">
                  {plans.map((plan) => {
                    const statusMeta = STATUS_META[plan.status] || STATUS_META.planning;
                    const spent = parseFloat(plan.total_actual || 0);
                    const budget = parseFloat(plan.total_budget || 0);
                    const progress = pct(spent, budget);
                    const overBudget = spent > budget && budget > 0;

                    return (
                      <div key={plan.id} className="bp-card">
                        <div className="bp-card__header">
                          <div>
                            <h3 className="bp-card__name">{plan.plan_name}</h3>
                            {plan.destination && (
                              <p className="bp-card__dest">📍 {plan.destination}</p>
                            )}
                          </div>
                          <span
                            className="bp-card__status"
                            style={{ background: `${statusMeta.color}20`, color: statusMeta.color }}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        {(plan.start_date || plan.end_date) && (
                          <p className="bp-card__dates">
                            🗓️&nbsp;
                            {plan.start_date || '?'} → {plan.end_date || '?'}
                          </p>
                        )}

                        {/* Budget progress */}
                        <div className="bp-card__budget">
                          <div className="bp-card__budget-row">
                            <span className="bp-card__budget-label">Total Budget</span>
                            <span className="bp-card__budget-value">
                              {plan.currency} {parseFloat(plan.total_budget || 0).toLocaleString()}
                            </span>
                          </div>
                          {budget > 0 && (
                            <>
                              <div className="bp-progress">
                                <div
                                  className={`bp-progress__bar ${overBudget ? 'over' : ''}`}
                                  style={{ '--bp-pct': `${progress}%` }}
                                />
                              </div>
                              <div className="bp-card__budget-row" style={{ marginTop: 4 }}>
                                <span className="bp-card__budget-label">
                                  Spent {plan.currency} {spent.toLocaleString()}
                                </span>
                                <span
                                  className="bp-card__budget-label"
                                  style={{ color: overBudget ? '#ef4444' : '#10b981' }}
                                >
                                  {overBudget ? 'Over budget!' : `${progress}% used`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Category summary */}
                        {plan.item_count > 0 && (
                          <p className="bp-card__items">{plan.item_count} expense item{plan.item_count !== 1 ? 's' : ''}</p>
                        )}

                        <div className="bp-card__actions">
                          <Link to={`/budget/${plan.id}`} className="bp-card__action-view">
                            View Details
                          </Link>
                          <button
                            className="bp-card__action-edit"
                            onClick={() => openEdit(plan)}
                          >
                            Edit
                          </button>
                          <button
                            className="bp-card__action-del"
                            onClick={() => handleDelete(plan.id)}
                            disabled={deletingId === plan.id}
                          >
                            {deletingId === plan.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="bp-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal__head">
              <div>
                <h2>{editing ? 'Edit Plan' : 'Plan Your Trip'}</h2>
                {!editing && <p className="bp-modal__subtitle">Fill in the details, then browse hotels &amp; activities on the next screen.</p>}
              </div>
              <button className="bp-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="bp-form" noValidate>
              <div className="bp-form__row">
                <label>Plan Name *</label>
                <input
                  className={formErrors.plan_name ? 'input-error' : ''}
                  value={form.plan_name}
                  onChange={(e) => { setForm({ ...form, plan_name: e.target.value }); if (formErrors.plan_name) setFormErrors((p) => ({ ...p, plan_name: '' })); }}
                  placeholder="e.g. Sri Lanka 2026 Trip"
                />
                {formErrors.plan_name && <span className="bp-field-error">{formErrors.plan_name}</span>}
              </div>
              <div className="bp-form__row">
                <label>Destination(s)</label>
                <input
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="e.g. Kandy, Galle, Ella…"
                />
              </div>
              <div className="bp-form__2col">
                <div className="bp-form__row">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    min={todayStr}
                    className={formErrors.start_date ? 'input-error' : ''}
                    value={form.start_date}
                    onChange={(e) => { setForm({ ...form, start_date: e.target.value }); if (formErrors.start_date) setFormErrors((p) => ({ ...p, start_date: '' })); }}
                  />
                  {formErrors.start_date && <span className="bp-field-error">{formErrors.start_date}</span>}
                </div>
                <div className="bp-form__row">
                  <label>End Date *</label>
                  <input
                    type="date"
                    min={form.start_date || todayStr}
                    className={formErrors.end_date ? 'input-error' : ''}
                    value={form.end_date}
                    onChange={(e) => { setForm({ ...form, end_date: e.target.value }); if (formErrors.end_date) setFormErrors((p) => ({ ...p, end_date: '' })); }}
                  />
                  {formErrors.end_date && <span className="bp-field-error">{formErrors.end_date}</span>}
                </div>
              </div>
              <div className="bp-form__2col">
                <div className="bp-form__row">
                  <label>Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className={formErrors.adult_count ? 'input-error' : ''}
                    value={form.adult_count}
                    onChange={(e) => { setForm({ ...form, adult_count: e.target.value }); if (formErrors.adult_count) setFormErrors((p) => ({ ...p, adult_count: '' })); }}
                  />
                  {formErrors.adult_count && <span className="bp-field-error">{formErrors.adult_count}</span>}
                </div>
                <div className="bp-form__row">
                  <label>Children</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={form.child_count}
                    onChange={(e) => setForm({ ...form, child_count: e.target.value })}
                  />
                </div>
              </div>
              <div className="bp-form__2col">
                <div className="bp-form__row">
                  <label>Total Budget *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={formErrors.total_budget ? 'input-error' : ''}
                    value={form.total_budget}
                    onChange={(e) => { setForm({ ...form, total_budget: e.target.value }); if (formErrors.total_budget) setFormErrors((p) => ({ ...p, total_budget: '' })); }}
                    placeholder="0.00"
                  />
                  {formErrors.total_budget && <span className="bp-field-error">{formErrors.total_budget}</span>}
                </div>
                <div className="bp-form__row">
                  <label>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editing && (
                <div className="bp-form__row">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="bp-form__row">
                <label>Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any extra notes about this trip…"
                />
              </div>
              <div className="bp-form__actions">
                <button type="button" className="bp-btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="bp-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Next → Start Planning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

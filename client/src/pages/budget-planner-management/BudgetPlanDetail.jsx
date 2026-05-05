import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { budgetAPI, hotelsAPI, lifestylesAPI } from '../../services/api';
import './BudgetPlanDetail.css';

const CATEGORIES = [
  { key: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#6366f1' },
  { key: 'transport',     label: 'Transport',      icon: '✈️',  color: '#0ea5e9' },
  { key: 'food',          label: 'Food & Dining',  icon: '🍽️',  color: '#f59e0b' },
  { key: 'activities',    label: 'Activities',     icon: '🎭',  color: '#10b981' },
  { key: 'shopping',      label: 'Shopping',       icon: '🛍️',  color: '#ec4899' },
  { key: 'miscellaneous', label: 'Miscellaneous',  icon: '📦',  color: '#8b5cf6' },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
const PERSONAL_CATS = ['shopping', 'food', 'transport', 'miscellaneous'];
const STATUS_META = {
  planning:  { label: 'Planning',   color: '#3b82f6' },
  active:    { label: 'Active',     color: '#10b981' },
  completed: { label: 'Completed',  color: '#6366f1' },
};

const fmt = (n, currency) => (currency || 'LKR') + ' ' + parseFloat(n || 0).toLocaleString();

// Approximate exchange rates to LKR (2026)
const FX = { LKR: 1, USD: 325, EUR: 355, GBP: 415, AUD: 210, SGD: 250, MYR: 75, INR: 4 };
function convertRate(amount, fromCurrency, toCurrency) {
  if (!amount || fromCurrency === toCurrency) return parseFloat(amount || 0);
  const lkr = parseFloat(amount) * (FX[fromCurrency] || 1);
  return Math.round(lkr / (FX[toCurrency] || 1));
}

function estimateHotelRate(hotel) {
  const stars = parseInt(hotel.star_classification) || 0;
  const cls   = (hotel.hotel_classification || '').toLowerCase();
  if (cls.includes('hostel') || cls.includes('budget') || cls.includes('guest')) return 4500;
  switch (stars) {
    case 5: return 88000;
    case 4: return 44000;
    case 3: return 22000;
    case 2: return 11000;
    case 1: return 6000;
    default: return 9500;
  }
}

function getDays(start, end) {
  if (!start || !end) return [];
  const days = [];
  const cur  = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
function formatDayTab(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    day: d.getDate(),
  };
}
function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const emptyItem = {
  category: 'miscellaneous', item_name: '', description: '',
  estimated_cost: '', actual_cost: '', item_date: '', notes: '',
};

export default function BudgetPlanDetail() {
  const { id } = useParams();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [activeDay,  setActiveDay]  = useState(null);
  const [contentTab, setContentTab] = useState('activities');

  const [hotelSearch,   setHotelSearch]   = useState('');
  const [hotels,        setHotels]        = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelToAdd,    setHotelToAdd]    = useState(null);
  const [hotelCost,     setHotelCost]     = useState('');

  const [activitySearch,    setActivitySearch]    = useState('');
  const [lifestyles,        setLifestyles]        = useState([]);
  const [lifestylesLoading, setLifestylesLoading] = useState(false);

  const [addingItemKey, setAddingItemKey] = useState(null); // 'ls-{id}' | 'hotel' | null
  const [deletingId, setDeletingId] = useState(null);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem,   setEditingItem]   = useState(null);
  const [itemForm,      setItemForm]      = useState(emptyItem);
  const [savingItem,    setSavingItem]    = useState(false);

  const [quickExpense, setQuickExpense] = useState({ item_name: '', estimated_cost: '', category: 'shopping' });
  const [savingQuick,  setSavingQuick]  = useState(false);

  const fetchPlan = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await budgetAPI.getPlan(id);
      setPlan(res.data);
    } catch { setError('Failed to load plan.'); }
    finally  { setLoading(false); }
  }, [id]);

  // Silent refresh — updates plan data without showing the full-page spinner
  const silentFetch = useCallback(async () => {
    try {
      const res = await budgetAPI.getPlan(id);
      setPlan(res.data);
    } catch { /* non-fatal */ }
  }, [id]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  useEffect(() => {
    if (plan && !activeDay) {
      const d = getDays(plan.start_date, plan.end_date);
      if (d.length > 0) setActiveDay(d[0]);
    }
  }, [plan, activeDay]);

  const fetchHotels = useCallback(async (q) => {
    setHotelsLoading(true);
    try {
      const params = { limit: 24 };
      if (q) params.search = q;
      else if (plan && plan.destination) params.search = plan.destination.split(',')[0].trim();
      const res = await hotelsAPI.getAll(params);
      setHotels(res.data || []);
    } catch { setHotels([]); }
    finally  { setHotelsLoading(false); }
  }, [plan]);

  const fetchLifestyles = useCallback(async (q) => {
    setLifestylesLoading(true);
    try {
      const params = { limit: 24 };
      if (q) params.search = q;
      else if (plan && plan.destination) params.search = plan.destination.split(',')[0].trim();
      const res = await lifestylesAPI.getAll(params);
      setLifestyles(res.data || []);
    } catch { setLifestyles([]); }
    finally  { setLifestylesLoading(false); }
  }, [plan]);

  useEffect(() => {
    if (!plan) return;
    if (contentTab === 'activities') {
      setHotels([]); // Clear hotels when switching to activities
      fetchLifestyles('');
    } else {
      setLifestyles([]); // Clear lifestyles when switching to hotels
      fetchHotels('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentTab, plan]);

  useEffect(() => {
    if (contentTab !== 'hotels') return;
    const t = setTimeout(() => fetchHotels(hotelSearch), 420);
    return () => clearTimeout(t);
  }, [hotelSearch, contentTab, fetchHotels]);

  useEffect(() => {
    if (contentTab !== 'activities') return;
    const t = setTimeout(() => fetchLifestyles(activitySearch), 420);
    return () => clearTimeout(t);
  }, [activitySearch, contentTab, fetchLifestyles]);

  const handleAddHotel = async () => {
    if (!hotelToAdd || !activeDay) return;
    setAddingItemKey('hotel');
    try {
      await budgetAPI.addItem(id, {
        category: 'accommodation',
        item_name: hotelToAdd.hotel_name,
        description: [hotelToAdd.star_classification, hotelToAdd.hotel_classification].filter(Boolean).join(' · '),
        estimated_cost: parseFloat(hotelCost) || 0,
        item_date: activeDay,
        notes: hotelToAdd.hotel_address || '',
      });
      setHotelToAdd(null); setHotelCost('');
      await silentFetch();
    } catch { setError('Failed to add hotel.'); }
    finally  { setAddingItemKey(null); }
  };

  const handleAddActivity = async (ls) => {
    if (!activeDay) return;
    const key = 'ls-' + ls.lifestyle_id;
    setAddingItemKey(key);
    try {
      await budgetAPI.addItem(id, {
        category: 'activities',
        item_name: ls.lifestyle_name,
        description: [ls.lifestyle_attraction_type, ls.lifestyle_city].filter(Boolean).join(' · '),
        estimated_cost: convertRate(parseFloat(ls.adult_rate) || 0, ls.currency || 'LKR', plan.currency || 'LKR'),
        item_date: activeDay,
        notes: ls.address || '',
      });
      await silentFetch();
    } catch { setError('Failed to add activity.'); }
    finally  { setAddingItemKey(null); }
  };

  const handleQuickExpense = async (e) => {
    e.preventDefault();
    setSavingQuick(true);
    try {
      await budgetAPI.addItem(id, {
        ...quickExpense,
        estimated_cost: parseFloat(quickExpense.estimated_cost) || 0,
        item_date: activeDay || '',
      });
      setQuickExpense({ item_name: '', estimated_cost: '', category: 'shopping' });
      await silentFetch();
    } catch { setError('Failed to add expense.'); }
    finally  { setSavingQuick(false); }
  };

  const openAddItem = (defaultCat, defaultDate) => {
    setEditingItem(null);
    setItemForm({ ...emptyItem, category: defaultCat || 'miscellaneous', item_date: defaultDate || '' });
    setShowItemModal(true);
  };
  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      category: item.category || 'miscellaneous', item_name: item.item_name || '',
      description: item.description || '', estimated_cost: item.estimated_cost ?? '',
      actual_cost: item.actual_cost ?? '', item_date: item.item_date || '', notes: item.notes || '',
    });
    setShowItemModal(true);
  };
  const handleItemSubmit = async (e) => {
    e.preventDefault(); setSavingItem(true);
    try {
      if (editingItem) await budgetAPI.updateItem(editingItem.id, itemForm);
      else             await budgetAPI.addItem(id, itemForm);
      setShowItemModal(false); await silentFetch();
    } catch { setError('Failed to save item.'); }
    finally  { setSavingItem(false); }
  };
  const handleDeleteItem = async (itemId) => {
    setDeletingId(itemId);
    try   { await budgetAPI.deleteItem(itemId); await silentFetch(); }
    catch { setError('Failed to delete item.'); }
    finally { setDeletingId(null); }
  };

  if (loading) return (
    <><Navbar />
      <div className="bpd-page"><div className="bpd-loading"><div className="bpd-spinner" /><p>Loading your plan…</p></div></div>
      <Footer /></>
  );
  if (error && !plan) return (
    <><Navbar />
      <div className="bpd-page"><div className="bpd-error"><p>{error}</p>
        <Link to="/budget" className="bpd-back-link">← Back to Budget Planner</Link></div></div>
      <Footer /></>
  );

  const budget    = parseFloat(plan.total_budget    || 0);
  const estimated = parseFloat(plan.total_estimated || 0);
  const spent     = parseFloat(plan.total_actual    || 0);
  const remaining = budget - estimated;
  const progress  = budget > 0 ? Math.min(100, Math.round((estimated / budget) * 100)) : 0;
  const overBudget = estimated > budget && budget > 0;

  const items   = plan.items || [];
  const days    = getDays(plan.start_date, plan.end_date);
  const hasDays = days.length > 0;
  const daySet  = new Set(days);
  const statusMeta = STATUS_META[plan.status] || STATUS_META.planning;

  const itemsByDay = {};
  days.forEach((d) => { itemsByDay[d] = { accommodation: [], activities: [], personal: [], other: [] }; });
  items.forEach((item) => {
    const target = itemsByDay[item.item_date];
    if (!target) return;
    if (item.category === 'accommodation') target.accommodation.push(item);
    else if (item.category === 'activities') target.activities.push(item);
    else if (PERSONAL_CATS.includes(item.category)) target.personal.push(item);
    else target.other.push(item);
  });
  const unscheduled = items.filter((i) => !i.item_date || !daySet.has(i.item_date));

  const catTotals = {};
  CATEGORIES.forEach((c) => {
    const ci = items.filter((i) => i.category === c.key);
    catTotals[c.key] = {
      count:     ci.length,
      estimated: ci.reduce((s, i) => s + parseFloat(i.estimated_cost || 0), 0),
    };
  });

  const activeDayItems = activeDay && itemsByDay[activeDay] ? itemsByDay[activeDay] : null;
  const activeDayTotal = activeDayItems
    ? [...activeDayItems.accommodation, ...activeDayItems.activities, ...activeDayItems.personal, ...activeDayItems.other]
        .reduce((s, i) => s + parseFloat(i.estimated_cost || 0), 0)
    : 0;
  const activeDayIdx = activeDay ? days.indexOf(activeDay) : -1;

  return (
    <>
      <Navbar />
      <div className="bpd-page">

        {/* Topbar */}
        <div className="bpd-topbar">
          <div className="bpd-topbar__inner">
            <Link to="/budget" className="bpd-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
            </Link>
            <div className="bpd-topbar__title">
              <h1>Browse &amp; Plan</h1>
              <p>{plan.plan_name}{plan.destination ? ' · ' + plan.destination : ''}</p>
            </div>
            <div className="bpd-topbar__right">
              <span className="bpd-status-badge" style={{ background: statusMeta.color + '22', color: statusMeta.color }}>
                {statusMeta.label}
              </span>
              {hasDays && (
                <span className="bpd-topbar__steps">
                  {activeDayIdx + 1} / {days.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bpd-alert-bar">
            {error}&ensp;<button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="bpd-body">

          {/* ── LEFT: Browse content ── */}
          <div className="bpd-content">

            {/* Meta chips */}
            <div className="bpd-meta-chips">
              {plan.start_date && plan.end_date && (
                <span className="bpd-chip">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {plan.start_date.slice(5)} – {plan.end_date.slice(5)}
                </span>
              )}
              {days.length > 0 && (
                <span className="bpd-chip">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                  {days.length} {days.length === 1 ? 'Night' : 'Nights'}
                </span>
              )}
              {plan.destination && (
                <span className="bpd-chip bpd-chip--dest">📍 {plan.destination}</span>
              )}
              {(plan.adult_count > 0 || plan.child_count > 0) && (
                <span className="bpd-chip">
                  👥 {plan.adult_count || 0} adult{(plan.adult_count || 0) !== 1 ? 's' : ''}
                  {plan.child_count > 0 ? `, ${plan.child_count} child${plan.child_count !== 1 ? 'ren' : ''}` : ''}
                </span>
              )}
            </div>

            {/* Day tabs */}
            {hasDays && (
              <div className="bpd-day-tabs">
                {days.map((day) => {
                  const tab = formatDayTab(day);
                  return (
                    <button
                      key={day}
                      className={'bpd-day-tab' + (day === activeDay ? ' active' : '')}
                      onClick={() => setActiveDay(day)}
                    >
                      <span className="bpd-day-tab__wd">{tab.weekday}</span>
                      <span className="bpd-day-tab__d">{tab.day}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Location bar */}
            {activeDay && plan.destination && (
              <div className="bpd-loc-bar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span>{plan.destination}</span>
                <span className="bpd-loc-sep">|</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span>{plan.destination}</span>
              </div>
            )}

            {/* Activities | Hotels tab bar */}
            {activeDay && (
              <div className="bpd-content-tabs">
                <button
                  className={'bpd-ctab' + (contentTab === 'activities' ? ' active' : '')}
                  onClick={() => setContentTab('activities')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Activities
                </button>
                <button
                  className={'bpd-ctab' + (contentTab === 'hotels' ? ' active' : '')}
                  onClick={() => setContentTab('hotels')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Hotels
                </button>
              </div>
            )}

            {/* Search bar */}
            {activeDay && (
              <div className="bpd-search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  key={contentTab}
                  autoComplete="off"
                  placeholder={
                    contentTab === 'activities'
                      ? ('Search activities in ' + (plan.destination || 'Sri Lanka') + '…')
                      : ('Search hotels in '     + (plan.destination || 'Sri Lanka') + '…')
                  }
                  value={contentTab === 'activities' ? activitySearch : hotelSearch}
                  onChange={(e) =>
                    contentTab === 'activities'
                      ? setActivitySearch(e.target.value)
                      : setHotelSearch(e.target.value)
                  }
                />
                {(contentTab === 'activities' ? activitySearch : hotelSearch) && (
                  <button className="bpd-search-clear"
                    onClick={() => contentTab === 'activities' ? setActivitySearch('') : setHotelSearch('')}>
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Cards grid */}
            {activeDay && (
              <div className="bpd-cards-grid">

                {contentTab === 'activities' && (
                  lifestylesLoading ? (
                    <div className="bpd-cards-state">
                      <div className="bpd-mini-spinner" /><span>Loading activities…</span>
                    </div>
                  ) : lifestyles.length === 0 ? (
                    <div className="bpd-cards-state bpd-cards-state--empty">
                      No activities found. Try a different search.
                    </div>
                  ) : lifestyles.map((ls, idx) => {
                    const alreadyAdded = activeDayItems
                      ? activeDayItems.activities.some((a) => a.item_name === ls.lifestyle_name)
                      : false;
                    return (
                      <div key={ls.lifestyle_id} className={'bpd-card' + (alreadyAdded ? ' bpd-card--added' : '')}>
                        <div className="bpd-card__img-wrap">
                          {ls.image
                            ? <img src={ls.image} alt={ls.lifestyle_name} loading="lazy" />
                            : <div className="bpd-card__img-placeholder">🎭</div>}
                          {idx < 2 && <span className="bpd-card__top-pick">TOP PICK</span>}
                          {alreadyAdded && <span className="bpd-card__added-badge">✓ Added</span>}
                        </div>
                        <div className="bpd-card__body">
                          <h3 className="bpd-card__name">{ls.lifestyle_name}</h3>
                          {ls.address && <p className="bpd-card__desc">{ls.address}</p>}
                          <div className="bpd-card__meta-row">
                            {ls.lifestyle_attraction_type && (
                              <span className="bpd-card__type">{ls.lifestyle_attraction_type}</span>
                            )}
                            {ls.lifestyle_city && (
                              <span className="bpd-card__city">📍 {ls.lifestyle_city}</span>
                            )}
                          </div>
                          <div className="bpd-card__footer">
                            <div className="bpd-card__price">
                              <strong>{fmt(convertRate(ls.adult_rate, ls.currency || 'LKR', plan.currency || 'LKR'), plan.currency)}</strong>
                              <span>/ adult</span>
                            </div>
                            <button
                              className={'bpd-card__add-btn' + (alreadyAdded ? ' added' : (addingItemKey === 'ls-' + ls.lifestyle_id ? ' loading' : ''))}
                              disabled={!!addingItemKey || alreadyAdded}
                              onClick={() => !alreadyAdded && handleAddActivity(ls)}
                            >
                              {addingItemKey === 'ls-' + ls.lifestyle_id
                                ? <span className="bpd-btn-spinner" />
                                : alreadyAdded ? '✓ Added' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {contentTab === 'hotels' && (
                  hotelsLoading ? (
                    <div className="bpd-cards-state">
                      <div className="bpd-mini-spinner" /><span>Loading hotels…</span>
                    </div>
                  ) : hotels.length === 0 ? (
                    <div className="bpd-cards-state bpd-cards-state--empty">
                      No hotels found. Try a different search.
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const daysFromNow = activeDay ? days.filter((d) => d >= activeDay).length : days.length;
                        const perNight    = daysFromNow > 0 && budget > 0 ? Math.round(remaining / daysFromNow) : 0;
                        return remaining > 0 && budget > 0 ? (
                          <div className="bpd-hotel-budget-banner">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 8v4M12 16h.01"/>
                            </svg>
                            <span>
                              Remaining budget: <strong>{fmt(remaining, plan.currency)}</strong>
                              {daysFromNow > 0 && (
                                <> &nbsp;·&nbsp; Est. per night: <strong>{fmt(perNight, plan.currency)}</strong></>
                              )}
                            </span>
                          </div>
                        ) : null;
                      })()}
                      {hotels.map((hotel, idx) => {
                    const alreadyAdded = activeDayItems
                      ? activeDayItems.accommodation.some((a) => a.item_name === hotel.hotel_name)
                      : false;
                    const stars = parseInt(hotel.star_classification) || 0;
                    return (
                      <div key={hotel.id} className={'bpd-card' + (alreadyAdded ? ' bpd-card--added' : '')}>
                        <div className="bpd-card__img-wrap">
                          {hotel.hotel_image
                            ? <img src={hotel.hotel_image} alt={hotel.hotel_name} loading="lazy" />
                            : <div className="bpd-card__img-placeholder">🏨</div>}
                          {idx < 2 && <span className="bpd-card__top-pick">TOP PICK</span>}
                          {alreadyAdded && <span className="bpd-card__added-badge">✓ Added</span>}
                        </div>
                        <div className="bpd-card__body">
                          <h3 className="bpd-card__name">{hotel.hotel_name}</h3>
                          {hotel.hotel_address && <p className="bpd-card__desc">{hotel.hotel_address}</p>}
                          <div className="bpd-card__meta-row">
                            {stars > 0 && <span className="bpd-card__stars">{'★'.repeat(Math.min(stars, 5))}</span>}
                            {hotel.hotel_classification && (
                              <span className="bpd-card__type">{hotel.hotel_classification}</span>
                            )}
                          </div>
                          <div className="bpd-card__footer">
                            <div className="bpd-card__price">
                              <strong>{fmt(estimateHotelRate(hotel), 'LKR')}</strong>
                              <span className="bpd-card__price-note">est. / night</span>
                            </div>
                            {alreadyAdded ? (
                              <button className="bpd-card__add-btn added" disabled>✓ Added</button>
                            ) : (
                              <button className="bpd-card__add-btn"
                                onClick={() => { setHotelToAdd(hotel); setHotelCost(String(estimateHotelRate(hotel))); }}>
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                    </>
                  )
                )}

              </div>
            )}

            {/* Added items for the active day */}
            {activeDay && activeDayItems && (
              <div className="bpd-day-added">
                <div className="bpd-day-added__header">
                  <span className="bpd-day-added__title">
                    {formatDay(activeDay)} — Your Plan
                  </span>
                  {activeDayTotal > 0 && (
                    <span className="bpd-day-added__total">{fmt(activeDayTotal, plan.currency)}</span>
                  )}
                </div>

                {activeDayItems.accommodation.length === 0 &&
                 activeDayItems.activities.length === 0 &&
                 activeDayItems.personal.length === 0 ? (
                  <p className="bpd-day-added__empty">
                    Nothing added yet — browse above and click <strong>+ Add</strong>.
                  </p>
                ) : (
                  <>
                    {activeDayItems.accommodation.length > 0 && (
                      <div className="bpd-day-added__section">
                        <span className="bpd-day-added__sec-label">🏨 Accommodation</span>
                        {activeDayItems.accommodation.map((item) => (
                          <div key={item.id} className="bpd-added-row">
                            <span className="bpd-added-row__name">{item.item_name}</span>
                            {item.description && <span className="bpd-added-row__desc">{item.description}</span>}
                            <span className="bpd-added-row__cost">{fmt(item.estimated_cost, plan.currency)}</span>
                            <button className="bpd-added-row__edit" onClick={() => openEditItem(item)}>✏️</button>
                            <button className="bpd-added-row__del" disabled={deletingId === item.id} onClick={() => handleDeleteItem(item.id)}>
                              {deletingId === item.id ? '…' : '✕'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDayItems.activities.length > 0 && (
                      <div className="bpd-day-added__section">
                        <span className="bpd-day-added__sec-label">🎭 Activities</span>
                        {activeDayItems.activities.map((item) => (
                          <div key={item.id} className="bpd-added-row">
                            <span className="bpd-added-row__name">{item.item_name}</span>
                            {item.description && <span className="bpd-added-row__desc">{item.description}</span>}
                            <span className="bpd-added-row__cost">{fmt(item.estimated_cost, plan.currency)}</span>
                            <button className="bpd-added-row__edit" onClick={() => openEditItem(item)}>✏️</button>
                            <button className="bpd-added-row__del" disabled={deletingId === item.id} onClick={() => handleDeleteItem(item.id)}>
                              {deletingId === item.id ? '…' : '✕'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeDayItems.personal.length > 0 && (
                      <div className="bpd-day-added__section">
                        <span className="bpd-day-added__sec-label">💳 Personal Expenses</span>
                        {activeDayItems.personal.map((item) => {
                          const cat = CAT[item.category] || CAT.miscellaneous;
                          return (
                            <div key={item.id} className="bpd-added-row">
                              <span className="bpd-added-row__icon">{cat.icon}</span>
                              <span className="bpd-added-row__name">{item.item_name}</span>
                              <span className="bpd-added-row__cost" style={{ color: cat.color }}>
                                {fmt(item.estimated_cost, plan.currency)}
                              </span>
                              <button className="bpd-added-row__edit" onClick={() => openEditItem(item)}>✏️</button>
                              <button className="bpd-added-row__del" disabled={deletingId === item.id} onClick={() => handleDeleteItem(item.id)}>
                                {deletingId === item.id ? '…' : '✕'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {activeDayItems.other.length > 0 && (
                      <div className="bpd-day-added__section">
                        <span className="bpd-day-added__sec-label">📦 Other</span>
                        {activeDayItems.other.map((item) => {
                          const cat = CAT[item.category] || CAT.miscellaneous;
                          return (
                            <div key={item.id} className="bpd-added-row">
                              <span className="bpd-added-row__icon">{cat.icon}</span>
                              <span className="bpd-added-row__name">{item.item_name}</span>
                              <span className="bpd-added-row__cost">{fmt(item.estimated_cost, plan.currency)}</span>
                              <button className="bpd-added-row__edit" onClick={() => openEditItem(item)}>✏️</button>
                              <button className="bpd-added-row__del" disabled={deletingId === item.id} onClick={() => handleDeleteItem(item.id)}>
                                {deletingId === item.id ? '…' : '✕'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                <button className="bpd-day-added__add-btn" onClick={() => openAddItem('miscellaneous', activeDay)}>
                  + Add Other Expense for This Day
                </button>
              </div>
            )}

            {/* Unscheduled items */}
            {unscheduled.length > 0 && (
              <div className="bpd-day-added bpd-day-added--unscheduled">
                <div className="bpd-day-added__header">
                  <span className="bpd-day-added__title">📌 Unscheduled Items</span>
                  <span className="bpd-day-added__total">{unscheduled.length} item{unscheduled.length !== 1 ? 's' : ''}</span>
                </div>
                {unscheduled.map((item) => {
                  const cat = CAT[item.category] || CAT.miscellaneous;
                  return (
                    <div key={item.id} className="bpd-added-row">
                      <span className="bpd-added-row__icon">{cat.icon}</span>
                      <span className="bpd-added-row__name">{item.item_name}</span>
                      <span className="bpd-added-row__cost">{fmt(item.estimated_cost, plan.currency)}</span>
                      <button className="bpd-added-row__edit" onClick={() => openEditItem(item)}>✏️</button>
                      <button className="bpd-added-row__del" disabled={deletingId === item.id} onClick={() => handleDeleteItem(item.id)}>
                        {deletingId === item.id ? '…' : '✕'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Budget Sidebar ── */}
          <aside className="bpd-budget-sidebar">

            {/* Budget Overview */}
            <div className="bpd-bs-card bpd-bs-overview">
              <div className="bpd-bs-overview__top">
                <span className="bpd-bs-overview__label">Total Budget</span>
                <span className="bpd-bs-overview__amount">{fmt(budget, plan.currency)}</span>
              </div>
              <div className="bpd-bs-progress">
                <div className="bpd-bs-progress__fill"
                  style={{ width: progress + '%', background: overBudget ? '#f87171' : '#34d399' }} />
              </div>
              <div className="bpd-bs-stat-row">
                <div className="bpd-bs-stat">
                  <span className="bpd-bs-stat__label">Estimated</span>
                  <span className="bpd-bs-stat__val">{fmt(estimated, plan.currency)}</span>
                </div>
                <div className="bpd-bs-stat">
                  <span className="bpd-bs-stat__label">Spent</span>
                  <span className="bpd-bs-stat__val"
                    style={{ color: spent > 0 ? '#fcd34d' : 'rgba(255,255,255,0.7)' }}>
                    {fmt(spent, plan.currency)}
                  </span>
                </div>
              </div>
              <div className={'bpd-bs-remaining' + (overBudget ? ' over' : '')}>
                <span>{overBudget ? '⚠️ Over budget by' : '✅ Remaining'}</span>
                <span className="bpd-bs-remaining__val">
                  {(overBudget ? '+' : '') + fmt(Math.abs(remaining), plan.currency)}
                </span>
              </div>
            </div>

            {/* Category Allocations */}
            <div className="bpd-bs-card">
              <h3 className="bpd-bs-card__title">💰 Allocations</h3>
              {CATEGORIES.map((c) => {
                const t = catTotals[c.key];
                if (!t || t.count === 0) return null;
                const pct = budget > 0 ? Math.min(100, Math.round((t.estimated / budget) * 100)) : 0;
                return (
                  <div key={c.key} className="bpd-bs-alloc">
                    <div className="bpd-bs-alloc__row">
                      <span className="bpd-bs-alloc__icon">{c.icon}</span>
                      <span className="bpd-bs-alloc__label">{c.label}</span>
                      <span className="bpd-bs-alloc__pct">{pct}%</span>
                    </div>
                    <div className="bpd-bs-alloc__track">
                      <div className="bpd-bs-alloc__fill" style={{ width: pct + '%', background: c.color }} />
                    </div>
                    <span className="bpd-bs-alloc__val" style={{ color: c.color }}>
                      {fmt(t.estimated, plan.currency)}
                    </span>
                  </div>
                );
              })}
              {CATEGORIES.every((c) => !catTotals[c.key] || catTotals[c.key].count === 0) && (
                <p className="bpd-bs-empty">No items yet — start adding above!</p>
              )}
            </div>

            {/* Personal Expense Quick-Add */}
            <div className="bpd-bs-card">
              <h3 className="bpd-bs-card__title">🛍️ Personal Expenses</h3>
              <p className="bpd-bs-card__sub">Shopping, meals, tips &amp; more</p>
              <form onSubmit={handleQuickExpense} className="bpd-quick-form">
                <select
                  value={quickExpense.category}
                  onChange={(e) => setQuickExpense({ ...quickExpense, category: e.target.value })}
                >
                  {PERSONAL_CATS.map((key) => {
                    const c = CAT[key];
                    return <option key={key} value={key}>{c.icon} {c.label}</option>;
                  })}
                </select>
                <input
                  required type="text"
                  placeholder="What did you spend on?"
                  value={quickExpense.item_name}
                  onChange={(e) => setQuickExpense({ ...quickExpense, item_name: e.target.value })}
                />
                <div className="bpd-quick-form__amtrow">
                  <input
                    required type="number" min="0" step="0.01"
                    placeholder={'Amount (' + (plan.currency || 'LKR') + ')'}
                    value={quickExpense.estimated_cost}
                    onChange={(e) => setQuickExpense({ ...quickExpense, estimated_cost: e.target.value })}
                  />
                  <button type="submit" className="bpd-quick-form__btn" disabled={savingQuick}>
                    {savingQuick ? '…' : '+ Add'}
                  </button>
                </div>
                {activeDay && (
                  <span className="bpd-quick-form__note">→ {formatDay(activeDay)}</span>
                )}
              </form>
            </div>

            {/* Plan Info */}
            <div className="bpd-bs-card bpd-bs-info">
              <h3 className="bpd-bs-card__title">{plan.plan_name}</h3>
              {plan.destination && <p className="bpd-bs-info__row">📍 {plan.destination}</p>}
              {plan.start_date && (
                <p className="bpd-bs-info__row">🗓 {plan.start_date} — {plan.end_date}</p>
              )}
              {items.length > 0 && (
                <p className="bpd-bs-info__row">📋 {items.length} item{items.length !== 1 ? 's' : ''} planned</p>
              )}
              {plan.notes && <p className="bpd-bs-info__notes">{plan.notes}</p>}
              <button className="bpd-bs-info__btn" onClick={() => openAddItem()}>+ Add Expense</button>
            </div>

          </aside>
        </div>
      </div>
      <Footer />

      {/* Hotel Cost Confirm Modal */}
      {hotelToAdd && (
        <div className="bp-modal-backdrop" onClick={() => { setHotelToAdd(null); setHotelCost(''); }}>
          <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal__head">
              <h2>Add Hotel to Plan</h2>
              <button className="bp-modal__close" onClick={() => { setHotelToAdd(null); setHotelCost(''); }}>✕</button>
            </div>
            <div className="bpd-hotel-confirm">
              {hotelToAdd.hotel_image && (
                <img className="bpd-hotel-confirm__img" src={hotelToAdd.hotel_image} alt={hotelToAdd.hotel_name} />
              )}
              <strong className="bpd-hotel-confirm__name">{hotelToAdd.hotel_name}</strong>
              <p className="bpd-hotel-confirm__meta">
                {[hotelToAdd.city, hotelToAdd.star_classification].filter(Boolean).join(' · ')}
              </p>
              {hotelToAdd.hotel_address && (
                <p className="bpd-hotel-confirm__addr">📍 {hotelToAdd.hotel_address}</p>
              )}
              <p className="bpd-hotel-confirm__day">
                Adding to: <strong>{activeDay ? formatDay(activeDay) : '—'}</strong>
              </p>
              <label className="bpd-hotel-confirm__label">
                Estimated cost per night ({plan.currency || 'LKR'})
              </label>
              <input
                autoFocus type="number" min="0" step="100"
                className="bpd-hotel-confirm__input"
                placeholder="e.g. 15000"
                value={hotelCost}
                onChange={(e) => setHotelCost(e.target.value)}
              />
              <div className="bp-form__actions">
                <button className="bp-btn-ghost" onClick={() => { setHotelToAdd(null); setHotelCost(''); }}>Cancel</button>
                <button className="bp-btn-primary" disabled={addingItemKey === 'hotel'} onClick={handleAddHotel}>
                  {addingItemKey === 'hotel' ? 'Adding…' : 'Add to Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Item Modal */}
      {showItemModal && (
        <div className="bp-modal-backdrop" onClick={() => setShowItemModal(false)}>
          <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal__head">
              <h2>{editingItem ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="bp-modal__close" onClick={() => setShowItemModal(false)}>✕</button>
            </div>
            <form onSubmit={handleItemSubmit} className="bp-form">
              <div className="bp-form__row">
                <label>Category</label>
                <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="bp-form__row">
                <label>Item Name *</label>
                <input required value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  placeholder="e.g. Shopping at Pettah Market" />
              </div>
              <div className="bp-form__row">
                <label>Description</label>
                <input value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Optional details" />
              </div>
              <div className="bp-form__2col">
                <div className="bp-form__row">
                  <label>Estimated Cost *</label>
                  <input required type="number" min="0" step="0.01"
                    value={itemForm.estimated_cost}
                    onChange={(e) => setItemForm({ ...itemForm, estimated_cost: e.target.value })}
                    placeholder="0.00" />
                </div>
                <div className="bp-form__row">
                  <label>Actual Cost</label>
                  <input type="number" min="0" step="0.01"
                    value={itemForm.actual_cost}
                    onChange={(e) => setItemForm({ ...itemForm, actual_cost: e.target.value })}
                    placeholder="0.00 (after trip)" />
                </div>
              </div>
              <div className="bp-form__row">
                <label>Date</label>
                <input type="date" value={itemForm.item_date}
                  onChange={(e) => setItemForm({ ...itemForm, item_date: e.target.value })} />
              </div>
              <div className="bp-form__row">
                <label>Notes</label>
                <textarea rows={2} value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  placeholder="Any notes…" />
              </div>
              <div className="bp-form__actions">
                <button type="button" className="bp-btn-ghost" onClick={() => setShowItemModal(false)}>Cancel</button>
                <button type="submit" className="bp-btn-primary" disabled={savingItem}>
                  {savingItem ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

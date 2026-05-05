import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faCheck,
  faTimes,
  faEye,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faUsers,
  faCarSide,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { transportAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminDrivers.css';

export default function AdminDrivers() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* Detail / Review */
  const [selected, setSelected] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => { fetchApps(); fetchStats(); }, [filter, page]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filter !== 'all') params.status = filter;
      const r = await transportAPI.adminGetApplications(params);
      setApplications(r.data || []);
      setTotalPages(r.pagination?.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const r = await transportAPI.adminGetStats(); setStats(r.data); }
    catch (e) { console.error(e); }
  };

  const handleReview = async (id, status) => {
    setReviewing(true);
    try {
      await transportAPI.adminReviewApplication(id, { status, admin_notes: reviewNotes });
      setSelected(null);
      setReviewNotes('');
      fetchApps();
      fetchStats();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to review application');
    } finally { setReviewing(false); }
  };

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.applicant?.full_name || '').toLowerCase().includes(q) ||
      (a.applicant?.email || '').toLowerCase().includes(q) ||
      (a.vehicle_type || '').toLowerCase().includes(q);
  });

  const statusIcon = (s) => {
    if (s === 'approved') return <FontAwesomeIcon icon={faCircleCheck} className="adm-dr-status-icon adm-dr-status--approved" />;
    if (s === 'rejected') return <FontAwesomeIcon icon={faCircleXmark} className="adm-dr-status-icon adm-dr-status--rejected" />;
    return <FontAwesomeIcon icon={faClock} className="adm-dr-status-icon adm-dr-status--pending" />;
  };

  return (
    <AdminLayout title="Driver Applications">
      {/* Stats row */}
      {stats && (
        <div className="adm-dr-stats">
          <div className="adm-dr-stat">
            <FontAwesomeIcon icon={faClipboardList} />
            <div>
              <strong>{stats.totalApplications ?? 0}</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="adm-dr-stat">
            <FontAwesomeIcon icon={faClock} />
            <div>
              <strong>{stats.pendingApplications ?? 0}</strong>
              <span>Pending</span>
            </div>
          </div>
          <div className="adm-dr-stat">
            <FontAwesomeIcon icon={faUsers} />
            <div>
              <strong>{stats.approvedDrivers ?? 0}</strong>
              <span>Active Drivers</span>
            </div>
          </div>
          <div className="adm-dr-stat">
            <FontAwesomeIcon icon={faCarSide} />
            <div>
              <strong>{stats.totalGigs ?? 0}</strong>
              <span>Total Gigs</span>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="adm-dr-toolbar">
        <div className="adm-dr-filters">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              className={`adm-dr-filter ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="adm-dr-search">
          <FontAwesomeIcon icon={faSearch} />
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="adm-dr-loading"><div className="adm-dr-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="adm-dr-empty">
          <FontAwesomeIcon icon={faIdCard} className="adm-dr-empty-icon" />
          <h3>No applications found</h3>
        </div>
      ) : (
        <div className="adm-dr-table-wrap">
          <table className="adm-dr-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Vehicle</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="adm-dr-applicant">
                      <strong>{a.applicant?.full_name || 'Unknown'}</strong>
                      <span>{a.applicant?.email || ''}</span>
                    </div>
                  </td>
                  <td>{a.vehicle_make} {a.vehicle_model} ({a.vehicle_year})</td>
                  <td>{a.passenger_capacity}</td>
                  <td>{statusIcon(a.status)} <span className={`adm-dr-status-text adm-dr-status-text--${a.status}`}>{a.status}</span></td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="adm-dr-view-btn" onClick={() => { setSelected(a); setReviewNotes(a.admin_notes || ''); }}>
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="adm-dr-pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="adm-dr-modal-overlay" onClick={() => setSelected(null)}>
          <div className="adm-dr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-dr-modal-header">
              <h2>Application Details</h2>
              <button className="adm-dr-modal-close" onClick={() => setSelected(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="adm-dr-modal-body">
              <div className="adm-dr-detail-row">
                <label>Applicant</label>
                <span>{selected.applicant?.full_name || 'Unknown'} ({selected.applicant?.email})</span>
              </div>

              <h4>License</h4>
              <div className="adm-dr-license-images">
                {selected.driving_license_front && <img src={selected.driving_license_front} alt="License Front" />}
                {selected.driving_license_back && <img src={selected.driving_license_back} alt="License Back" />}
              </div>

              <h4>Vehicle Details</h4>
              <div className="adm-dr-detail-grid">
                <div><label>Type</label><span>{selected.vehicle_type}</span></div>
                <div><label>Make</label><span>{selected.vehicle_make}</span></div>
                <div><label>Model</label><span>{selected.vehicle_model}</span></div>
                <div><label>Year</label><span>{selected.vehicle_year}</span></div>
                <div><label>Plate</label><span>{selected.vehicle_plate}</span></div>
                <div><label>Color</label><span>{selected.vehicle_color}</span></div>
                <div><label>Capacity</label><span>{selected.passenger_capacity}</span></div>
              </div>

              {selected.vehicle_images?.length > 0 && (
                <>
                  <h4>Vehicle Photos</h4>
                  <div className="adm-dr-vehicle-images">
                    {selected.vehicle_images.map((url, i) => (
                      <img key={i} src={url} alt={`Vehicle ${i + 1}`} />
                    ))}
                  </div>
                </>
              )}

              <div className="adm-dr-detail-row">
                <label>Status</label>
                {statusIcon(selected.status)} <span className={`adm-dr-status-text adm-dr-status-text--${selected.status}`}>{selected.status}</span>
              </div>

              {selected.status === 'pending' && (
                <div className="adm-dr-review-section">
                  <h4>Review</h4>
                  <textarea
                    placeholder="Admin notes (optional)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="adm-dr-review-actions">
                    <button className="adm-dr-approve-btn" onClick={() => handleReview(selected.id, 'approved')} disabled={reviewing}>
                      <FontAwesomeIcon icon={faCheck} /> Approve
                    </button>
                    <button className="adm-dr-reject-btn" onClick={() => handleReview(selected.id, 'rejected')} disabled={reviewing}>
                      <FontAwesomeIcon icon={faTimes} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {selected.admin_notes && selected.status !== 'pending' && (
                <div className="adm-dr-detail-row">
                  <label>Admin Notes</label>
                  <span>{selected.admin_notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

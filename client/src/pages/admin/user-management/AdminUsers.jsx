import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTimes, faUser, faEnvelope, faShield,
  faCalendarDays, faLocationDot, faEarthAsia, faCircleCheck, faCircleXmark,
  faCar,
} from '@fortawesome/free-solid-svg-icons';
import { usersAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminUsers.css';

const ROLE_LABELS = { user: 'User', admin: 'Admin' };
const ROLE_COLORS = { user: 'badge--user', admin: 'badge--admin' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1, limit: 20 });
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { fetchUsers(); }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll(filters);
      setUsers(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—';

  return (
    <AdminLayout title="User Management">
      <div className="admin-users-page">
        <div className="admin-header">
          <div>
            <h1><FontAwesomeIcon icon={faUsers} /> User Management</h1>
            <p>View and manage all registered users</p>
          </div>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            className="search-input"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {pagination && (
            <div className="results-count">
              Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}–
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state"><p>No users found.</p></div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Driver</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="au-row" onClick={() => setSelectedUser(u)} title="Click to view details">
                      <td className="au-id">{u.id}</td>
                      <td className="au-name">
                        {u.profile_picture
                          ? <img src={u.profile_picture} alt="" className="au-avatar" />
                          : <span className="au-avatar-initials">{(u.full_name || u.email || 'U')[0].toUpperCase()}</span>
                        }
                        {u.full_name || '—'}
                      </td>
                      <td>{u.email}</td>
                      <td><span className={`au-badge ${ROLE_COLORS[u.role] || ''}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                      <td>
                        <span className={`au-badge ${u.is_active ? 'badge--active' : 'badge--inactive'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{u.is_driver ? <span className="au-badge badge--driver">Driver</span> : '—'}</td>
                      <td>{fmt(u.created_at)}</td>
                      <td>{fmt(u.last_login_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="au-overlay" onClick={() => setSelectedUser(null)}>
          <div className="au-modal" onClick={(e) => e.stopPropagation()}>
            <button className="au-modal__close" onClick={() => setSelectedUser(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="au-modal__header">
              {selectedUser.profile_picture ? (
                <img src={selectedUser.profile_picture} alt="" className="au-modal__avatar" />
              ) : (
                <div className="au-modal__avatar-placeholder">
                  {(selectedUser.full_name || selectedUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <h2>{selectedUser.full_name || '—'}</h2>
              <div className="au-modal__badges">
                <span className={`au-badge ${ROLE_COLORS[selectedUser.role] || ''}`}>
                  <FontAwesomeIcon icon={faShield} /> {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                </span>
                <span className={`au-badge ${selectedUser.is_active ? 'badge--active' : 'badge--inactive'}`}>
                  <FontAwesomeIcon icon={selectedUser.is_active ? faCircleCheck : faCircleXmark} />
                  {selectedUser.is_active ? 'Active' : 'Inactive'}
                </span>
                {selectedUser.is_driver && (
                  <span className="au-badge badge--driver"><FontAwesomeIcon icon={faCar} /> Driver</span>
                )}
              </div>
            </div>

            <div className="au-modal__body">
              <div className="au-detail-grid">
                <div className="au-detail-item">
                  <span className="au-detail-label"><FontAwesomeIcon icon={faUser} /> User ID</span>
                  <span className="au-detail-value">#{selectedUser.id}</span>
                </div>
                <div className="au-detail-item">
                  <span className="au-detail-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
                  <span className="au-detail-value">{selectedUser.email}</span>
                </div>
                {selectedUser.nationality && (
                  <div className="au-detail-item">
                    <span className="au-detail-label"><FontAwesomeIcon icon={faEarthAsia} /> Nationality</span>
                    <span className="au-detail-value">{selectedUser.nationality}</span>
                  </div>
                )}
                {selectedUser.location && (
                  <div className="au-detail-item">
                    <span className="au-detail-label"><FontAwesomeIcon icon={faLocationDot} /> Location</span>
                    <span className="au-detail-value">{selectedUser.location}</span>
                  </div>
                )}
                <div className="au-detail-item">
                  <span className="au-detail-label"><FontAwesomeIcon icon={faCalendarDays} /> Joined</span>
                  <span className="au-detail-value">{fmt(selectedUser.created_at)}</span>
                </div>
                <div className="au-detail-item">
                  <span className="au-detail-label"><FontAwesomeIcon icon={faCalendarDays} /> Last Login</span>
                  <span className="au-detail-value">{fmt(selectedUser.last_login_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

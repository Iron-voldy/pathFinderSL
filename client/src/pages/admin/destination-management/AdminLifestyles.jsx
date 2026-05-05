import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { lifestylesAPI, destinationsAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminLifestyles.css';

const AdminLifestyles = () => {
  const [lifestyles, setLifestyles] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    destination_id: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    fetchLifestyles();
  }, [filters]);

  const loadDestinations = async () => {
    try {
      const res = await destinationsAPI.getAll({ limit: 200, is_active: 'true' });
      setDestinations(res.data || []);
    } catch {
      /* non-critical */
    }
  };

  const fetchLifestyles = async () => {
    setLoading(true);
    try {
      const response = await lifestylesAPI.getAll(filters);
      setLifestyles(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching lifestyles:', error);
      alert('Failed to fetch lifestyle activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await lifestylesAPI.delete(id);
      alert('Activity deleted successfully');
      fetchLifestyles();
    } catch (error) {
      console.error('Error deleting lifestyle:', error);
      alert('Failed to delete activity');
    }
  };



  return (
    <AdminLayout title="Activities Management">
      <div className="admin-lifestyles-page">

        <div className="admin-header">
          <div>
            <h1>Lifestyle Activity Management</h1>
            <p>Manage all activities and experiences linked to destinations</p>
          </div>
          <Link to="/admin/dev/lifestyles/add" className="btn-add">
            <FontAwesomeIcon icon={faPlus} /> Add New Activity
          </Link>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            className="search-input"
          />
          <select
            value={filters.destination_id}
            onChange={(e) => setFilters((f) => ({ ...f, destination_id: e.target.value, page: 1 }))}
            className="filter-select"
          >
            <option value="">All Destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {pagination ? (
            <div className="results-count">{pagination.totalItems} activities</div>
          ) : null}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading activities...</p>
          </div>
        ) : lifestyles.length === 0 ? (
          <div className="empty-state">
            <p>No activities found</p>
            <Link to="/admin/dev/lifestyles/add" className="btn-add">Add First Activity</Link>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Rate (LKR)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lifestyles.map((act) => (
                    <tr key={act.lifestyle_id}>
                      <td>{act.lifestyle_id}</td>
                      <td>
                        <strong>{act.lifestyle_name}</strong>
                        {act.sub_description ? (
                          <p className="sub-text">{act.sub_description.substring(0, 65)}…</p>
                        ) : null}
                      </td>
                      <td>
                        <span className="category-tag">{act.lifestyle_attraction_type || '—'}</span>
                      </td>
                      <td>{act.lifestyle_city || <em style={{ color: '#94a3b8' }}>—</em>}</td>
                      <td className="coords-cell">
                        {act.adult_rate && parseFloat(act.adult_rate) > 0
                          ? `${parseFloat(act.adult_rate).toLocaleString()} ${act.currency || 'LKR'}`
                          : <em style={{ color: '#94a3b8' }}>Free</em>}
                      </td>
                      <td>
                        <span className={`status-badge ${act.active_status === 1 ? 'status-active' : 'status-inactive'}`}>
                          {act.active_status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <Link
                          to={`/admin/dev/lifestyles/edit/${act.lifestyle_id}`}
                          className="btn-action btn-edit"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Link>
                        <button
                          onClick={() => handleDelete(act.lifestyle_id, act.lifestyle_name)}
                          className="btn-action btn-delete"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="pagination">
                <button
                  className="btn-page"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn-page"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminLifestyles;

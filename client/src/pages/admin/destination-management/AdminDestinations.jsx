import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { destinationsAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminDestinations.css';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', is_active: '', page: 1, limit: 20 });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, [filters]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await destinationsAPI.getAll(filters);
      setDestinations(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      alert('Failed to fetch destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await destinationsAPI.delete(id);
      alert('Destination deleted successfully');
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    }
  };

  return (
    <AdminLayout title="Destination Management">
      <div className="admin-destinations-page">

        <div className="admin-header">
          <div>
            <h1>Destination Management</h1>
            <p>Manage all travel destinations in Sri Lanka</p>
          </div>
          <Link to="/admin/dev/destinations/add" className="btn-add">
            <FontAwesomeIcon icon={faPlus} /> Add New Destination
          </Link>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search destinations..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            className="search-input"
          />
          <select
            value={filters.is_active}
            onChange={(e) => setFilters((f) => ({ ...f, is_active: e.target.value, page: 1 }))}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {pagination ? (
            <div className="results-count">{pagination.totalItems} destinations</div>
          ) : null}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="empty-state">
            <p>No destinations found</p>
            <Link to="/admin/dev/destinations/add" className="btn-add">Add First Destination</Link>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((dest) => (
                    <tr key={dest.id}>
                      <td>{dest.id}</td>
                      <td>
                        {dest.image_url ? (
                          <img
                            src={dest.image_url}
                            alt={dest.name}
                            className="table-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="table-image-placeholder">No Image</div>
                        )}
                      </td>
                      <td>
                        <strong>{dest.name}</strong>
                        {dest.tagline ? <p className="sub-text">{dest.tagline}</p> : null}
                      </td>
                      <td>{dest.region || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${dest.is_active ? 'status-active' : 'status-inactive'}`}>
                          {dest.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <Link
                          to={`/destinations/${dest.id}`}
                          className="btn-action btn-view"
                          title="View"
                          target="_blank"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link
                          to={`/admin/dev/destinations/edit/${dest.id}`}
                          className="btn-action btn-edit"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Link>
                        <button
                          onClick={() => handleDelete(dest.id, dest.name)}
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

export default AdminDestinations;

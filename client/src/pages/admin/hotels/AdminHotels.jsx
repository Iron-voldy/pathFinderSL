import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { hotelsAPI } from '../../../services/api';
import './AdminHotels.css';

// Normalize legacy numeric DB values
const normalizeStatus = (val) => {
  const map = { '0': 'inactive', '1': 'active', '2': 'pending', '3': 'maintenance' };
  if (val == null) return 'N/A';
  return map[String(val)] || String(val);
};

const normalizeStar = (val) => {
  const map = { '1': '1-star', '2': '2-star', '3': '3-star', '4': '4-star', '5': '5-star' };
  if (val == null) return 'N/A';
  return map[String(val)] || String(val);
};

const AdminHotels = () => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    hotel_status: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState(null);

  // Show success banner from route state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelsAPI.getAll(filters);
      setHotels(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      alert('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, hotelName) => {
    if (!window.confirm(`Are you sure you want to delete "${hotelName}"?`)) {
      return;
    }

    try {
      await hotelsAPI.delete(id);
      alert('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  return (
    <div className="admin-hotels-page">

      {/* Success banner */}
      {successMsg && (
        <div className="ah-success-banner">
          ✓ {successMsg}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Hotel Management</h1>
          <p>Manage all hotels and accommodations</p>
        </div>
        <Link to="/admin/dev/hotels/add" className="btn-add">
          <FontAwesomeIcon icon={faPlus} /> Add New Hotel
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search hotels..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
          }
          className="search-input"
        />
        
        <select
          value={filters.hotel_status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, hotel_status: e.target.value, page: 1 }))
          }
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        {pagination && (
          <div className="results-count">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
          </div>
        )}
      </div>

      {/* Hotels Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading hotels...</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="empty-state">
          <p>No hotels found</p>
          <Link to="/admin/dev/hotels/add" className="btn-primary">
            Add First Hotel
          </Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Hotel Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>{hotel.id}</td>
                    <td>
                      <img
                        src={hotel.hotel_image || '/no_img.jpg'}
                        alt={hotel.hotel_name}
                        className="table-image"
                        onError={(e) => {
                          e.target.src = '/no_img.jpg';
                        }}
                      />
                    </td>
                    <td className="hotel-name-cell">
                      <strong>{hotel.hotel_name}</strong>
                      {hotel.sub_description && (
                        <p className="sub-text">{hotel.sub_description.substring(0, 60)}...</p>
                      )}
                    </td>
                    <td>{hotel.city || 'N/A'}</td>
                    <td>{hotel.country || 'N/A'}</td>
                    <td>{normalizeStar(hotel.star_classification)}</td>
                    <td>
                      <span className={`status-badge status-${normalizeStatus(hotel.hotel_status)}`}>
                        {normalizeStatus(hotel.hotel_status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="btn-action btn-view"
                        title="View"
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      <Link
                        to={`/admin/dev/hotels/edit/${hotel.id}`}
                        className="btn-action btn-edit"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Link>
                      <button
                        onClick={() => handleDelete(hotel.id, hotel.hotel_name)}
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-page"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: pagination.currentPage - 1 }))
                }
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                className="btn-page"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: pagination.currentPage + 1 }))
                }
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHotels;

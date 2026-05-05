import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { destinationsAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminDestinationForm.css';

const AdminEditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      const response = await destinationsAPI.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching destination:', error);
      alert('Failed to load destination details');
      navigate('/admin/dev/destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await destinationsAPI.update(id, formData);
      alert('Destination updated successfully!');
      navigate('/admin/dev/destinations');
    } catch (error) {
      console.error('Error updating destination:', error);
      alert(error.response?.data?.message || 'Failed to update destination');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading destination details...</div>;
  }
  if (!formData) {
    return <div className="error-page">Destination not found</div>;
  }

  return (
    <AdminLayout title="Edit Destination">
      <div className="admin-container">

        <div className="form-header">
          <h1>Edit Destination</h1>
          <button type="button" onClick={() => navigate('/admin/dev/destinations')} className="btn-back">
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dest-form">

          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">Destination Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                placeholder="e.g., Sigiriya Rock Fortress"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleChange}
                placeholder="Short memorable phrase"
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows="5"
                placeholder="Detailed description of this destination"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                  placeholder="e.g., Central Province"
                />
              </div>

              <div className="form-group">
                <label htmlFor="is_active">Status</label>
                <select
                  id="is_active"
                  name="is_active"
                  value={String(formData.is_active ?? true)}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Media</h2>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/sigiriya.jpg"
              />
              {formData.image_url ? (
                <div className="image-preview">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/dev/destinations')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Destination'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEditDestination;

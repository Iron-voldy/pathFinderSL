import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lifestylesAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminLifestyleForm.css';

const AdminEditLifestyle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchLifestyle();
  }, [id]);

  const fetchLifestyle = async () => {
    try {
      const response = await lifestylesAPI.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching activity:', error);
      alert('Failed to load activity details');
      navigate('/admin/dev/lifestyles');
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
      const payload = {
        lifestyle_name: formData.lifestyle_name,
        sub_description: formData.sub_description,
        lifestyle_city: formData.lifestyle_city,
        lifestyle_attraction_type: formData.lifestyle_attraction_type,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image: formData.image,
        adult_rate: formData.adult_rate ? parseFloat(formData.adult_rate) : null,
        child_rate: formData.child_rate ? parseFloat(formData.child_rate) : null,
        currency: formData.currency,
        selling_points: formData.selling_points,
        active_status: parseInt(formData.active_status),
      };
      await lifestylesAPI.update(id, payload);
      alert('Activity updated successfully!');
      navigate('/admin/dev/lifestyles');
    } catch (error) {
      console.error('Error updating activity:', error);
      alert(error.response?.data?.message || 'Failed to update activity');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-page">Loading activity details...</div>;
  if (!formData) return <div className="error-page">Activity not found</div>;

  return (
    <AdminLayout title="Edit Activity">
      <div className="admin-container">

        <div className="form-header">
          <h1>Edit Activity</h1>
          <button type="button" onClick={() => navigate('/admin/dev/lifestyles')} className="btn-back">
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lifestyle-form">

          <div className="form-section">
            <h2>Activity Details</h2>

            <div className="form-group">
              <label htmlFor="lifestyle_name">Name *</label>
              <input
                type="text"
                id="lifestyle_name"
                name="lifestyle_name"
                value={formData.lifestyle_name || ''}
                onChange={handleChange}
                required
                placeholder="Activity name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub_description">Short Description</label>
              <textarea
                id="sub_description"
                name="sub_description"
                value={formData.sub_description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Brief summary..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lifestyle_city">City</label>
                <input
                  type="text"
                  id="lifestyle_city"
                  name="lifestyle_city"
                  value={formData.lifestyle_city || ''}
                  onChange={handleChange}
                  placeholder="e.g., Kandy"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lifestyle_attraction_type">Attraction Type</label>
                <input
                  type="text"
                  id="lifestyle_attraction_type"
                  name="lifestyle_attraction_type"
                  value={formData.lifestyle_attraction_type || ''}
                  onChange={handleChange}
                  placeholder="e.g., Wellness"
                />
              </div>

              <div className="form-group">
                <label htmlFor="active_status">Status</label>
                <select
                  id="active_status"
                  name="active_status"
                  value={formData.active_status ?? 1}
                  onChange={handleChange}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="selling_points">Selling Points / Tags</label>
              <input
                type="text"
                id="selling_points"
                name="selling_points"
                value={formData.selling_points || ''}
                onChange={handleChange}
                placeholder="e.g., Relaxation, Ayurvedic, Herbal Oils"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adult_rate">Adult Rate</label>
                <input type="number" id="adult_rate" name="adult_rate" value={formData.adult_rate || ''} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="child_rate">Child Rate</label>
                <input type="number" id="child_rate" name="child_rate" value={formData.child_rate || ''} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select id="currency" name="currency" value={formData.currency || 'LKR'} onChange={handleChange}>
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Full street address" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input type="text" id="latitude" name="latitude" value={formData.latitude || ''} onChange={handleChange} placeholder="e.g., 7.9553" />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input type="text" id="longitude" name="longitude" value={formData.longitude || ''} onChange={handleChange} placeholder="e.g., 80.7718" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Media</h2>
            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                placeholder="https://example.com/activity.jpg"
              />
              {formData.image ? (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/dev/lifestyles')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Activity'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEditLifestyle;

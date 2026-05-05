import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lifestylesAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminLifestyleForm.css';

const AdminAddLifestyle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lifestyle_name: '',
    sub_description: '',
    lifestyle_city: '',
    lifestyle_attraction_type: '',
    address: '',
    latitude: '',
    longitude: '',
    image: '',
    adult_rate: '',
    child_rate: '',
    currency: 'LKR',
    selling_points: '',
    active_status: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        active_status: parseInt(formData.active_status),
        adult_rate: formData.adult_rate ? parseFloat(formData.adult_rate) : null,
        child_rate: formData.child_rate ? parseFloat(formData.child_rate) : null,
      };
      await lifestylesAPI.create(payload);
      alert('Activity created successfully!');
      navigate('/admin/dev/lifestyles');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert(error.response?.data?.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Activity">
      <div className="admin-container">

        <div className="form-header">
          <h1>Add New Activity</h1>
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
                value={formData.lifestyle_name}
                onChange={handleChange}
                required
                placeholder="e.g., Full Body Massage by Ayurvedic Center"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub_description">Short Description</label>
              <textarea
                id="sub_description"
                name="sub_description"
                value={formData.sub_description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief summary of this activity..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lifestyle_city">City</label>
                <input
                  type="text"
                  id="lifestyle_city"
                  name="lifestyle_city"
                  value={formData.lifestyle_city}
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
                  value={formData.lifestyle_attraction_type}
                  onChange={handleChange}
                  placeholder="e.g., Wellness, Adventure"
                />
              </div>

              <div className="form-group">
                <label htmlFor="active_status">Status</label>
                <select
                  id="active_status"
                  name="active_status"
                  value={formData.active_status}
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
                value={formData.selling_points}
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
                <input
                  type="number"
                  id="adult_rate"
                  name="adult_rate"
                  value={formData.adult_rate}
                  onChange={handleChange}
                  placeholder="e.g., 6695"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="child_rate">Child Rate</label>
                <input
                  type="number"
                  id="child_rate"
                  name="child_rate"
                  value={formData.child_rate}
                  onChange={handleChange}
                  placeholder="e.g., 3000"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
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
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full street address"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input type="text" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g., 7.9553" />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input type="text" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g., 80.7718" />
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
                value={formData.image}
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Activity'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddLifestyle;

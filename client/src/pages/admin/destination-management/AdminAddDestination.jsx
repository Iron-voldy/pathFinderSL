import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationsAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminDestinationForm.css';

const AdminAddDestination = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    image_url: '',
    region: '',
    is_active: true,
  });

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) {
      e.name = 'Destination name is required';
    } else if (formData.name.trim().length < 3) {
      e.name = 'Name must be at least 3 characters';
    } else if (formData.name.trim().length > 200) {
      e.name = 'Name must be under 200 characters';
    }

    if (formData.tagline && formData.tagline.trim().length > 200) {
      e.tagline = 'Tagline must be under 200 characters';
    }

    if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 20) {
      e.description = 'Description must be at least 20 characters (currently ' + formData.description.trim().length + ')';
    } else if (formData.description && formData.description.trim().length > 5000) {
      e.description = 'Description must be under 5000 characters';
    }

    if (formData.image_url && formData.image_url.trim()) {
      try { new URL(formData.image_url); } catch { e.image_url = 'Must be a valid URL'; }
    }

    if (formData.region && formData.region.trim().length > 100) {
      e.region = 'Region must be under 100 characters';
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      await destinationsAPI.create(formData);
      alert('Destination created successfully!');
      navigate('/admin/dev/destinations');
    } catch (error) {
      console.error('Error creating destination:', error);
      alert(error.response?.data?.message || 'Failed to create destination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Destination">
      <div className="admin-container">

        <div className="form-header">
          <h1>Add New Destination</h1>
          <button type="button" onClick={() => navigate('/admin/dev/destinations')} className="btn-back">
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dest-form" noValidate>

          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">Destination Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Sigiriya Rock Fortress"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Short memorable phrase"
                maxLength="200"
                className={errors.tagline ? 'input-error' : ''}
              />
              {errors.tagline && <span className="field-error">{errors.tagline}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
                {formData.description && (
                  <span className={`char-count ${formData.description.trim().length < 20 ? 'char-count--warn' : 'char-count--ok'}`}>
                    {formData.description.trim().length} / 20 min
                  </span>
                )}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Detailed description of this destination (minimum 20 characters)"
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g., Central Province"
                  className={errors.region ? 'input-error' : ''}
                />
                {errors.region && <span className="field-error">{errors.region}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="is_active">Status</label>
                <select
                  id="is_active"
                  name="is_active"
                  value={formData.is_active}
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
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/sigiriya.jpg"
                className={errors.image_url ? 'input-error' : ''}
              />
              {errors.image_url && <span className="field-error">{errors.image_url}</span>}
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Destination'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddDestination;

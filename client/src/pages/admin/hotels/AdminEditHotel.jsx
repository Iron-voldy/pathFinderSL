import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hotelsAPI, SERVER_BASE_URL } from '../../../services/api';
import Navbar from '../../../components/shared/Navbar';
import Footer from '../../../components/shared/Footer';
import './AdminHotelForm.css';

const AdminEditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState(null);
  const [imageMode, setImageMode] = useState('url');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  // Map legacy numeric DB values to valid enum strings
  const normalizeHotelData = (data) => {
    const d = { ...data };
    const starMap = { '1': '1-star', '2': '2-star', '3': '3-star', '4': '4-star', '5': '5-star' };
    if (d.star_classification != null && starMap[String(d.star_classification)]) {
      d.star_classification = starMap[String(d.star_classification)];
    }
    const validStars = ['1-star', '2-star', '3-star', '4-star', '5-star', 'Unrated'];
    if (!validStars.includes(d.star_classification)) d.star_classification = '3-star';

    const statusMap = { '0': 'inactive', '1': 'active', '2': 'pending', '3': 'maintenance' };
    if (d.hotel_status != null && statusMap[String(d.hotel_status)]) {
      d.hotel_status = statusMap[String(d.hotel_status)];
    }
    const validStatuses = ['active', 'inactive', 'pending', 'maintenance'];
    if (!validStatuses.includes(d.hotel_status)) d.hotel_status = 'active';

    const validTypes = ['Hotel', 'Resort', 'Villa', 'Guesthouse', 'Apartment', 'Hostel', 'Boutique', 'Other'];
    if (d.hotel_classification != null && !validTypes.includes(d.hotel_classification)) {
      d.hotel_classification = null;
    }

    // Ensure all string fields default to '' to prevent controlled-input warnings
    d.hotel_name = d.hotel_name ?? '';
    d.hotel_description = d.hotel_description ?? '';
    d.sub_description = d.sub_description ?? '';
    d.hotel_address = d.hotel_address ?? '';
    d.city = d.city ?? '';
    d.country = d.country ?? '';
    d.micro_location = d.micro_location ?? '';
    d.latitude = d.latitude ?? '';
    d.longitude = d.longitude ?? '';
    d.hotel_image = d.hotel_image ?? '';
    d.trip_advisor_link = d.trip_advisor_link ?? '';
    d.provider = d.provider ?? '';
    d.markup = d.markup != null ? Number(d.markup) : 15;
    return d;
  };

  const fetchHotel = async () => {
    try {
      const response = await hotelsAPI.getById(id);
      setFormData(normalizeHotelData(response.data));
    } catch (error) {
      console.error('Error fetching hotel:', error);
      alert('Failed to load hotel details');
      navigate('/admin/dev/hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Auto-upload when file is selected
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const response = await hotelsAPI.uploadImage(file);
      const fullUrl = SERVER_BASE_URL + response.data.url;
      setFormData((prev) => ({ ...prev, hotel_image: fullUrl }));
    } catch (error) {
      console.error('Image upload failed:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
      setUploadedFile(null);
      setUploadPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    // Strip DB-managed fields before sending
    const {
      id: _id,
      created_at,
      updated_at,
      deleted_at,
      triggers,
      additional_data_1,
      temp_column,
      ...updatePayload
    } = formData;
    try {
      await hotelsAPI.update(id, updatePayload);
      navigate('/admin/dev/hotels', { state: { successMessage: 'Hotel updated successfully!' } });
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert(error.response?.data?.message || 'Failed to update hotel');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="hf-fullscreen-state">
        <div className="hf-spinner"></div>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="hf-fullscreen-state">
        <p>Hotel not found.</p>
        <button onClick={() => navigate('/admin/dev/hotels')} className="hf-btn hf-btn--primary">
          Back to Hotels
        </button>
      </div>
    );
  }

  const previewSrc = imageMode === 'upload' ? uploadPreview : formData.hotel_image;

  return (
    <div className="hf-page">
      <Navbar />

      <main className="hf-main">
        {/* Page header */}
        <div className="hf-page-header">
          <div className="hf-page-header__left">
            <span className="hf-page-header__tag">Hotel #{id}</span>
            <h1 className="hf-page-header__title">Edit Hotel</h1>
          </div>
          <button type="button" className="hf-btn hf-btn--ghost" onClick={() => navigate('/admin/dev/hotels')}>
             Back to Hotels
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hf-form-layout">

          {/*  LEFT COLUMN  */}
          <div className="hf-form-col">

            {/* Section: Basic Info */}
            <section className="hf-card">
              <h2 className="hf-card__title">Basic Information</h2>

              <div className="hf-field">
                <label className="hf-label" htmlFor="hotel_name">Hotel Name <span className="hf-required">*</span></label>
                <input className="hf-input" type="text" id="hotel_name" name="hotel_name"
                  value={formData.hotel_name || ''} onChange={handleChange}
                  required placeholder="Enter hotel name" />
              </div>

              <div className="hf-field">
                <label className="hf-label" htmlFor="sub_description">Tagline</label>
                <input className="hf-input" type="text" id="sub_description" name="sub_description"
                  value={formData.sub_description || ''} onChange={handleChange}
                  placeholder="Short tagline or subtitle" maxLength="500" />
              </div>

              <div className="hf-field">
                <label className="hf-label" htmlFor="hotel_description">Description</label>
                <textarea className="hf-input hf-textarea" id="hotel_description" name="hotel_description"
                  value={formData.hotel_description || ''} onChange={handleChange}
                  rows="4" placeholder="Detailed description of the hotel" />
              </div>

              <div className="hf-row hf-row--3">
                <div className="hf-field">
                  <label className="hf-label" htmlFor="star_classification">Star Rating <span className="hf-required">*</span></label>
                  <select className="hf-input hf-select" id="star_classification" name="star_classification"
                    value={formData.star_classification || '3-star'} onChange={handleChange} required>
                    <option value="1-star"> 1 Star</option>
                    <option value="2-star"> 2 Star</option>
                    <option value="3-star"> 3 Star</option>
                    <option value="4-star"> 4 Star</option>
                    <option value="5-star"> 5 Star</option>
                    <option value="Unrated">Unrated</option>
                  </select>
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="hotel_classification">Type <span className="hf-required">*</span></label>
                  <select className="hf-input hf-select" id="hotel_classification" name="hotel_classification"
                    value={formData.hotel_classification || 'Hotel'} onChange={handleChange} required>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Guesthouse">Guesthouse</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="hotel_status">Status <span className="hf-required">*</span></label>
                  <select className="hf-input hf-select" id="hotel_status" name="hotel_status"
                    value={formData.hotel_status || 'active'} onChange={handleChange} required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section: Location */}
            <section className="hf-card">
              <h2 className="hf-card__title">Location</h2>

              <div className="hf-field">
                <label className="hf-label" htmlFor="hotel_address">Address <span className="hf-required">*</span></label>
                <textarea className="hf-input hf-textarea" id="hotel_address" name="hotel_address"
                  value={formData.hotel_address || ''} onChange={handleChange}
                  required rows="2" placeholder="Full address" />
              </div>

              <div className="hf-row hf-row--3">
                <div className="hf-field">
                  <label className="hf-label" htmlFor="city">City</label>
                  <input className="hf-input" type="text" id="city" name="city"
                    value={formData.city || ''} onChange={handleChange} placeholder="City name" />
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="micro_location">Area</label>
                  <input className="hf-input" type="text" id="micro_location" name="micro_location"
                    value={formData.micro_location || ''} onChange={handleChange}
                    placeholder="Area / Neighbourhood" />
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="country">Country</label>
                  <input className="hf-input" type="text" id="country" name="country"
                    value={formData.country || ''} onChange={handleChange} placeholder="Country" />
                </div>
              </div>

              <div className="hf-row hf-row--2">
                <div className="hf-field">
                  <label className="hf-label" htmlFor="latitude">Latitude</label>
                  <input className="hf-input" type="text" id="latitude" name="latitude"
                    value={formData.latitude || ''} onChange={handleChange} placeholder="e.g. 6.9271" />
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="longitude">Longitude</label>
                  <input className="hf-input" type="text" id="longitude" name="longitude"
                    value={formData.longitude || ''} onChange={handleChange} placeholder="e.g. 79.8612" />
                </div>
              </div>
            </section>

            {/* Section: Extra */}
            <section className="hf-card">
              <h2 className="hf-card__title">Additional Details</h2>

              <div className="hf-field">
                <label className="hf-label" htmlFor="trip_advisor_link">TripAdvisor Link</label>
                <input className="hf-input" type="text" id="trip_advisor_link" name="trip_advisor_link"
                  value={formData.trip_advisor_link || ''} onChange={handleChange}
                  placeholder="https://www.tripadvisor.com/..." />
              </div>

              <div className="hf-row hf-row--2">
                <div className="hf-field">
                  <label className="hf-label" htmlFor="provider">Provider</label>
                  <input className="hf-input" type="text" id="provider" name="provider"
                    value={formData.provider || ''} onChange={handleChange} placeholder="Service provider" />
                </div>
                <div className="hf-field">
                  <label className="hf-label" htmlFor="markup">Markup (%)</label>
                  <input className="hf-input" type="number" id="markup" name="markup"
                    value={formData.markup ?? 15} onChange={handleChange} min="0" max="100" />
                </div>
              </div>
            </section>

          </div>{/* end .hf-form-col */}

          {/*  RIGHT SIDEBAR  */}
          <aside className="hf-sidebar">

            {/* Image Card */}
            <div className="hf-card hf-image-card">
              <h2 className="hf-card__title">Hotel Image</h2>

              <div className="hf-img-preview-wrap">
                <img
                  className="hf-img-preview"
                  src={previewSrc || '/no_img.jpg'}
                  alt="Hotel preview"
                  onError={(e) => { e.target.src = '/no_img.jpg'; }}
                />
              </div>

              {/* Mode tabs */}
              <div className="hf-img-tabs">
                <button type="button"
                  className={`hf-img-tab${imageMode === 'url' ? ' hf-img-tab--active' : ''}`}
                  onClick={() => setImageMode('url')}>
                   URL
                </button>
                <button type="button"
                  className={`hf-img-tab${imageMode === 'upload' ? ' hf-img-tab--active' : ''}`}
                  onClick={() => setImageMode('upload')}>
                   Upload
                </button>
              </div>

              {imageMode === 'url' ? (
                <div className="hf-field" key="img-url">
                  <input className="hf-input" type="text" name="hotel_image"
                    value={formData.hotel_image != null ? formData.hotel_image : ''}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg" />
                </div>
              ) : (
                <div className="hf-field">
                  <input type="file" className="hf-file-input"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    disabled={uploadingImage} />
                  {uploadingImage && (
                    <p className="hf-uploading-msg">⏳ Uploading image…</p>
                  )}
                  {uploadedFile && !uploadingImage && (
                    <p className="hf-file-name">📎 {uploadedFile.name}</p>
                  )}
                  {formData.hotel_image && imageMode === 'upload' && !uploadingImage &&
                    <p className="hf-upload-ok">✓ Uploaded successfully</p>}
                </div>
              )}
            </div>

            {/* Meta Card */}
            <div className="hf-card hf-meta-card">
              <h2 className="hf-card__title">Publishing</h2>
              <div className="hf-meta-row">
                <span className="hf-meta-key">Hotel ID</span>
                <span className="hf-meta-val">#{id}</span>
              </div>
              <div className="hf-meta-row">
                <span className="hf-meta-key">Status</span>
                <span className={`hf-status-pill hf-status-pill--${formData.hotel_status || 'active'}`}>
                  {formData.hotel_status || 'active'}
                </span>
              </div>
              {formData.city && (
                <div className="hf-meta-row">
                  <span className="hf-meta-key">City</span>
                  <span className="hf-meta-val">{formData.city}</span>
                </div>
              )}
              {formData.star_classification && (
                <div className="hf-meta-row">
                  <span className="hf-meta-key">Stars</span>
                  <span className="hf-meta-val">{formData.star_classification}</span>
                </div>
              )}
            </div>

            {/* Action buttons (visible in sidebar on desktop) */}
            <div className="hf-sidebar-actions">
              <button type="submit" className="hf-btn hf-btn--primary hf-btn--full" disabled={updating}>
                {updating ? 'Saving' : 'Save Changes'}
              </button>
              <button type="button" className="hf-btn hf-btn--ghost hf-btn--full"
                onClick={() => navigate('/admin/dev/hotels')}>
                Cancel
              </button>
            </div>

          </aside>

          {/* Mobile-only action bar (shown below form on small screens) */}
          <div className="hf-mobile-actions">
            <button type="button" className="hf-btn hf-btn--ghost" onClick={() => navigate('/admin/dev/hotels')}>
              Cancel
            </button>
            <button type="submit" className="hf-btn hf-btn--primary" disabled={updating}>
              {updating ? 'Saving' : 'Save Changes'}
            </button>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AdminEditHotel;

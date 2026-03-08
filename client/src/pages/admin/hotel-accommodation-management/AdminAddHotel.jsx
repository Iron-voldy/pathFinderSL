import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera, faPaperclip, faTimes, faLocationDot, faHotel,
  faMap, faStar, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { hotelsAPI } from '../../../services/api';
import AdminLayout from '../AdminLayout';
import './AdminHotelForm.css';

const getStarCount = (starStr) => {
  const match = /^(\d)-star$/.exec(starStr);
  return match ? parseInt(match[1]) : 0;
};

const STATUS_COLOR = {
  active: '#22c55e',
  inactive: '#94a3b8',
  pending: '#f59e0b',
  maintenance: '#ef4444',
};

const AdminAddHotel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    hotel_name: '',
    hotel_description: '',
    star_classification: '3-star',
    hotel_classification: 'Hotel',
    hotel_address: '',
    hotel_image: '',
    country: 'Sri Lanka',
    city: '',
    micro_location: '',
    hotel_status: 'active',
    longitude: '',
    latitude: '',
    markup: '',
    sub_description: '',
    provider: '',
    trip_advisor_link: '',
  });

  const validate = () => {
    const e = {};

    if (!formData.hotel_name.trim()) {
      e.hotel_name = 'Hotel name is required';
    } else if (formData.hotel_name.trim().length < 3) {
      e.hotel_name = 'Hotel name must be at least 3 characters';
    }

    if (formData.hotel_description && formData.hotel_description.trim().length > 0 && formData.hotel_description.trim().length < 50) {
      e.hotel_description = 'Description must be at least 50 characters (currently ' + formData.hotel_description.trim().length + ')';
    }

    if (!formData.hotel_address.trim()) {
      e.hotel_address = 'Hotel address is required';
    } else if (formData.hotel_address.trim().length < 10) {
      e.hotel_address = 'Address must be at least 10 characters';
    }

    if (!imageFile && !formData.hotel_image.trim()) {
      e.hotel_image = 'Please upload an image or enter an image URL';
    }

    if (formData.latitude && !/^-?([0-9]{1,2}\.?[0-9]*)$/.test(formData.latitude.trim())) {
      e.latitude = 'Invalid latitude (e.g. 6.9271)';
    }

    if (formData.longitude && !/^-?([0-9]{1,3}\.?[0-9]*)$/.test(formData.longitude.trim())) {
      e.longitude = 'Invalid longitude (e.g. 79.8612)';
    }

    if (formData.markup !== '' && (isNaN(Number(formData.markup)) || Number(formData.markup) < 0)) {
      e.markup = 'Price must be a positive number';
    }

    if (formData.trip_advisor_link && formData.trip_advisor_link.trim()) {
      try { new URL(formData.trip_advisor_link); } catch { e.trip_advisor_link = 'Must be a valid URL'; }
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreviewUrl(reader.result);
    reader.readAsDataURL(file);
    if (errors.hotel_image) setErrors((prev) => ({ ...prev, hotel_image: '' }));
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const removeFile = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'hotel_image' && value !== '' && value !== null && value !== undefined) {
            payload.append(key, value);
          }
        });
        if (formData.hotel_image) payload.append('hotel_image', formData.hotel_image);
        payload.append('hotel_image_file', imageFile);
      } else {
        payload = { ...formData };
        Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k]; });
      }

      await hotelsAPI.create(payload);
      alert('Hotel created successfully!');
      navigate('/admin/dev/hotels');
    } catch (error) {
      console.error('Error creating hotel:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create hotel';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl = imagePreviewUrl || formData.hotel_image;
  const hasMapCoords = formData.latitude.trim() && formData.longitude.trim();
  const mapEmbedUrl = hasMapCoords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(formData.latitude)},${encodeURIComponent(formData.longitude)}&z=15&output=embed`
    : null;
  const starCount = getStarCount(formData.star_classification);
  const descLen = formData.hotel_description.length;

  return (
    <AdminLayout title="Add New Hotel">
      <div className="admin-container">
        <div className="form-header">
          <h1>Add New Hotel</h1>
          <button onClick={() => navigate('/admin/dev/hotels')} className="btn-back">
            Back to List
          </button>
        </div>

        <div className="add-hotel-layout">
          {/* LEFT: FORM */}
          <form onSubmit={handleSubmit} className="hotel-form" noValidate>

            <div className="form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label htmlFor="hotel_name">Hotel Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="hotel_name"
                  name="hotel_name"
                  value={formData.hotel_name}
                  onChange={handleChange}
                  placeholder="Enter hotel name"
                  className={errors.hotel_name ? 'input-error' : ''}
                />
                {errors.hotel_name && <span className="field-error">{errors.hotel_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="sub_description">Tagline</label>
                <input
                  type="text"
                  id="sub_description"
                  name="sub_description"
                  value={formData.sub_description}
                  onChange={handleChange}
                  placeholder="Short tagline or subtitle"
                  maxLength="500"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hotel_description">
                  Description
                  {formData.hotel_description && (
                    <span className={`char-count ${descLen < 50 ? 'char-count--warn' : 'char-count--ok'}`}>
                      {descLen} / 50 min
                    </span>
                  )}
                </label>
                <textarea
                  id="hotel_description"
                  name="hotel_description"
                  value={formData.hotel_description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Detailed description of the hotel (minimum 50 characters)"
                  className={errors.hotel_description ? 'input-error' : ''}
                />
                {errors.hotel_description && <span className="field-error">{errors.hotel_description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="star_classification">Star Rating <span className="required">*</span></label>
                  <select id="star_classification" name="star_classification" value={formData.star_classification} onChange={handleChange}>
                    <option value="1-star">1 Star</option>
                    <option value="2-star">2 Star</option>
                    <option value="3-star">3 Star</option>
                    <option value="4-star">4 Star</option>
                    <option value="5-star">5 Star</option>
                    <option value="Unrated">Unrated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hotel_classification">Type <span className="required">*</span></label>
                  <select id="hotel_classification" name="hotel_classification" value={formData.hotel_classification} onChange={handleChange}>
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

                <div className="form-group">
                  <label htmlFor="hotel_status">Status <span className="required">*</span></label>
                  <select id="hotel_status" name="hotel_status" value={formData.hotel_status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Location</h2>

              <div className="form-group">
                <label htmlFor="hotel_address">Address <span className="required">*</span></label>
                <textarea
                  id="hotel_address"
                  name="hotel_address"
                  value={formData.hotel_address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Full address (minimum 10 characters)"
                  className={errors.hotel_address ? 'input-error' : ''}
                />
                {errors.hotel_address && <span className="field-error">{errors.hotel_address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City name" />
                </div>
                <div className="form-group">
                  <label htmlFor="micro_location">Area</label>
                  <input type="text" id="micro_location" name="micro_location" value={formData.micro_location} onChange={handleChange} placeholder="Specific area or neighborhood" />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g., 6.9271"
                    className={errors.latitude ? 'input-error' : ''}
                  />
                  {errors.latitude && <span className="field-error">{errors.latitude}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g., 79.8612"
                    className={errors.longitude ? 'input-error' : ''}
                  />
                  {errors.longitude && <span className="field-error">{errors.longitude}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Media &amp; Pricing</h2>

              <div className="form-group">
                <label>Hotel Image <span className="required">*</span></label>
                <div
                  className={`upload-zone ${dragOver ? 'upload-zone--drag' : ''} ${imageFile ? 'upload-zone--filled' : ''} ${errors.hotel_image ? 'upload-zone--error' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="upload-input-hidden"
                  />
                  {imageFile ? (
                    <div className="upload-zone__file-info">
                      {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" className="upload-thumbnail" />}
                      <div className="upload-zone__file-meta">
                        <span className="upload-filename">
                          <FontAwesomeIcon icon={faPaperclip} /> {imageFile.name}
                        </span>
                        <span className="upload-filesize">{(imageFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button type="button" className="upload-remove-btn" onClick={removeFile}>
                        <FontAwesomeIcon icon={faXmark} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="upload-zone__placeholder">
                      <span className="upload-icon-big">
                        <FontAwesomeIcon icon={faCamera} />
                      </span>
                      <span className="upload-text">Drag &amp; drop or <strong>click to upload</strong></span>
                      <span className="upload-hint">JPG, PNG, WEBP — max 10 MB</span>
                    </div>
                  )}
                </div>
                {errors.hotel_image && <span className="field-error">{errors.hotel_image}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hotel_image">Or paste Image URL</label>
                <input
                  type="url"
                  id="hotel_image"
                  name="hotel_image"
                  value={formData.hotel_image}
                  onChange={handleChange}
                  placeholder="https://example.com/hotel-image.jpg"
                  disabled={!!imageFile}
                  className={imageFile ? 'input-disabled' : ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="markup">Price Per Night (LKR) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="markup"
                    name="markup"
                    value={formData.markup}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    placeholder="e.g., 15000"
                    className={errors.markup ? 'input-error' : ''}
                  />
                  {errors.markup && <span className="field-error">{errors.markup}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="provider">Provider</label>
                  <input type="text" id="provider" name="provider" value={formData.provider} onChange={handleChange} placeholder="Service provider" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="trip_advisor_link">TripAdvisor Link</label>
                <input
                  type="url"
                  id="trip_advisor_link"
                  name="trip_advisor_link"
                  value={formData.trip_advisor_link}
                  onChange={handleChange}
                  placeholder="https://www.tripadvisor.com/..."
                  className={errors.trip_advisor_link ? 'input-error' : ''}
                />
                {errors.trip_advisor_link && <span className="field-error">{errors.trip_advisor_link}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin/dev/hotels')} className="btn-cancel">Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Hotel'}
              </button>
            </div>
          </form>

          {/* RIGHT: LIVE PREVIEW */}
          <aside className="hotel-preview-panel">
            <div className="preview-panel-sticky">
              <h3 className="preview-panel-title">Live Preview</h3>

              <div className="preview-card">
                <div className="preview-card__img-wrap">
                  {currentImageUrl ? (
                    <img
                      src={currentImageUrl}
                      alt="Hotel"
                      className="preview-card__img"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="preview-card__img-placeholder"
                    style={{ display: currentImageUrl ? 'none' : 'flex' }}
                  >
                    <FontAwesomeIcon icon={faHotel} />
                  </div>
                  <div className="preview-card__badge-row">
                    <span className="preview-badge preview-badge--type">{formData.hotel_classification}</span>
                    <span
                      className="preview-badge preview-badge--status"
                      style={{ background: STATUS_COLOR[formData.hotel_status] || '#94a3b8' }}
                    >
                      {formData.hotel_status}
                    </span>
                  </div>
                </div>

                <div className="preview-card__body">
                  <h4 className="preview-card__name">{formData.hotel_name || 'Hotel Name'}</h4>

                  {starCount > 0 && (
                    <div className="preview-card__stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < starCount ? 'star star--on' : 'star star--off'}
                        />
                      ))}
                      <span className="star-label">{formData.star_classification}</span>
                    </div>
                  )}

                  {formData.sub_description && (
                    <p className="preview-card__tagline">"{formData.sub_description}"</p>
                  )}

                  {formData.hotel_description && (
                    <p className="preview-card__desc">
                      {formData.hotel_description.length > 130
                        ? formData.hotel_description.slice(0, 130) + '...'
                        : formData.hotel_description}
                    </p>
                  )}

                  <div className="preview-card__location">
                    <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                    <span>
                      {[formData.micro_location, formData.city, formData.country]
                        .filter(Boolean)
                        .join(', ') || 'Location not set'}
                    </span>
                  </div>

                  {formData.hotel_address && (
                    <div className="preview-card__address">{formData.hotel_address}</div>
                  )}

                  {formData.markup && !isNaN(Number(formData.markup)) && (
                    <div className="preview-card__price">
                      <span className="price-from">From</span>
                      <span className="price-amount">LKR {Number(formData.markup).toLocaleString()}</span>
                      <span className="price-per">/ night</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="preview-map-section">
                <h4 className="preview-map-title">
                  <FontAwesomeIcon icon={faLocationDot} /> Map Location
                </h4>
                {mapEmbedUrl ? (
                  <div className="preview-map-wrapper">
                    <iframe
                      title="Hotel Location"
                      src={mapEmbedUrl}
                      width="100%"
                      height="240"
                      style={{ border: 0, borderRadius: '10px' }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="map-coords">
                      <span>Lat: <strong>{formData.latitude}</strong></span>
                      <span>Lng: <strong>{formData.longitude}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="preview-map-placeholder">
                    <FontAwesomeIcon icon={faMap} className="map-placeholder-icon" />
                    <p>Enter latitude &amp; longitude to see the map</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAddHotel;
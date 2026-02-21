import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelsAPI, SERVER_BASE_URL } from '../../../services/api';
import Navbar from '../../../components/shared/Navbar';
import Footer from '../../../components/shared/Footer';
import './AdminHotelForm.css';

const AdminAddHotel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    markup: 15,
    sub_description: '',
    provider: '',
    trip_advisor_link: '',
  });

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
    if (!formData.hotel_image) {
      alert('Please provide a hotel image (URL or upload a file).');
      return;
    }
    setLoading(true);
    try {
      await hotelsAPI.create(formData);
      alert('Hotel created successfully!');
      navigate('/admin/dev/hotels');
    } catch (error) {
      console.error('Error creating hotel:', error);
      alert(error.response?.data?.message || 'Failed to create hotel');
    } finally {
      setLoading(false);
    }
  };

  const currentImagePreview = imageMode === 'upload' ? uploadPreview : formData.hotel_image;

  return (
    <div className="admin-page">
      <Navbar />
      
      <div className="admin-container">
        <div className="form-header">
          <h1>Add New Hotel</h1>
          <button onClick={() => navigate('/admin/dev/hotels')} className="btn-back">
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hotel-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="hotel_name">Hotel Name *</label>
              <input
                type="text"
                id="hotel_name"
                name="hotel_name"
                value={formData.hotel_name || ''}
                onChange={handleChange}
                required
                placeholder="Enter hotel name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub_description">Tagline</label>
              <input
                type="text"
                id="sub_description"
                name="sub_description"
                value={formData.sub_description || ''}
                onChange={handleChange}
                placeholder="Short tagline or subtitle"
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hotel_description">Description</label>
              <textarea
                id="hotel_description"
                name="hotel_description"
                value={formData.hotel_description || ''}
                onChange={handleChange}
                rows="5"
                placeholder="Detailed description of the hotel"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="star_classification">Star Rating *</label>
                <select
                  id="star_classification"
                  name="star_classification"
                  value={formData.star_classification || '3-star'}
                  onChange={handleChange}
                  required
                >
                  <option value="1-star">1 Star</option>
                  <option value="2-star">2 Star</option>
                  <option value="3-star">3 Star</option>
                  <option value="4-star">4 Star</option>
                  <option value="5-star">5 Star</option>
                  <option value="Unrated">Unrated</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hotel_classification">Type *</label>
                <select
                  id="hotel_classification"
                  name="hotel_classification"
                  value={formData.hotel_classification || 'Hotel'}
                  onChange={handleChange}
                  required
                >
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
                <label htmlFor="hotel_status">Status *</label>
                <select
                  id="hotel_status"
                  name="hotel_status"
                  value={formData.hotel_status || 'active'}
                  onChange={handleChange}
                  required
                >
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
              <label htmlFor="hotel_address">Address *</label>
              <textarea
                id="hotel_address"
                name="hotel_address"
                value={formData.hotel_address || ''}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Full address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  placeholder="City name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="micro_location">Area</label>
                <input
                  type="text"
                  id="micro_location"
                  name="micro_location"
                  value={formData.micro_location || ''}
                  onChange={handleChange}
                  placeholder="Specific area or neighborhood"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude || ''}
                  onChange={handleChange}
                  placeholder="e.g., 6.9271"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleChange}
                  placeholder="e.g., 79.8612"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Media &amp; Links</h2>
            
            {/* Image Mode Toggle */}
            <div className="form-group">
              <label>Hotel Image *</label>
              <div className="image-mode-tabs">
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageMode('url')}
                >
                  🔗 Image URL
                </button>
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageMode('upload')}
                >
                  📁 Upload File
                </button>
              </div>

              {imageMode === 'url' ? (
                <div className="image-url-input">
                  <input
                    type="text"
                    id="hotel_image"
                    name="hotel_image"
                    value={formData.hotel_image || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <div className="image-upload-input">
                  <input
                    type="file"
                    id="hotel_image_file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="file-input"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p style={{ fontSize: '0.82rem', color: '#e67e22', margin: '0.4rem 0' }}>⏳ Uploading image...</p>
                  )}
                  {uploadedFile && !uploadingImage && (
                    <p style={{ fontSize: '0.8rem', color: '#555', margin: '0.35rem 0 0.25rem', wordBreak: 'break-all' }}>
                      📎 {uploadedFile.name}
                    </p>
                  )}
                  {formData.hotel_image && imageMode === 'upload' && !uploadingImage && (
                    <span className="upload-success">✓ Image uploaded successfully</span>
                  )}
                </div>
              )}

              {currentImagePreview && (
                <div className="image-preview">
                  <img
                    src={currentImagePreview}
                    alt="Preview"
                    onError={(e) => {
                      e.target.src = '/no_img.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="trip_advisor_link">TripAdvisor Link</label>
              <input
                type="text"
                id="trip_advisor_link"
                name="trip_advisor_link"
                value={formData.trip_advisor_link || ''}
                onChange={handleChange}
                placeholder="https://www.tripadvisor.com/..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="provider">Provider</label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider || ''}
                  onChange={handleChange}
                  placeholder="Service provider"
                />
              </div>

              <div className="form-group">
                <label htmlFor="markup">Markup (%)</label>
                <input
                  type="number"
                  id="markup"
                  name="markup"
                  value={formData.markup ?? 15}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="15"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dev/hotels')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AdminAddHotel;

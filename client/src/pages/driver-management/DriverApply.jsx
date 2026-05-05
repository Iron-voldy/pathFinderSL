import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faCarSide,
  faCameraRetro,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faArrowLeft,
  faUpload,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { transportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './DriverApply.css';

const VEHICLE_TYPES = [
  'Hatchback', 'Sedan', 'Luxury Car',
  'SUV', '4WD', 'MPV/Minivan',
  'Passenger Van', 'Mini Coach', 'Tour Bus',
  'Campervan', 'Open-top Safari', 'Convertible',
];

const DriverApply = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDriver } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // File state for license images
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState(null);
  const [licenseBackPreview, setLicenseBackPreview] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Vehicle images (up to 5 files)
  const [vehicleFiles, setVehicleFiles] = useState([]);   // File objects
  const [vehiclePreviews, setVehiclePreviews] = useState([]); // object URLs
  const vehicleInputRef = useRef(null);

  const [form, setForm] = useState({
    vehicle_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    vehicle_color: '',
    passenger_capacity: '',
    vehicle_description: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/userlogin');
      return;
    }
    fetchApplication();
  }, [isAuthenticated]);

  const fetchApplication = async () => {
    try {
      const res = await transportAPI.getMyApplication();
      setApplication(res.data);
    } catch (err) {
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseFile = (field, file) => {
    if (!file) return;
    if (field === 'front') {
      setLicenseFront(file);
      setLicenseFrontPreview(URL.createObjectURL(file));
    } else {
      setLicenseBack(file);
      setLicenseBackPreview(URL.createObjectURL(file));
    }
  };

  const clearLicense = (field) => {
    if (field === 'front') {
      setLicenseFront(null);
      setLicenseFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setLicenseBack(null);
      setLicenseBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const handleVehicleFiles = (newFiles) => {
    const remaining = 5 - vehicleFiles.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(newFiles).slice(0, remaining);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setVehicleFiles((p) => [...p, ...toAdd]);
    setVehiclePreviews((p) => [...p, ...previews]);
  };

  const removeVehicleImage = (idx) => {
    setVehicleFiles((p) => p.filter((_, i) => i !== idx));
    setVehiclePreviews((p) => p.filter((_, i) => i !== idx));
    if (vehicleInputRef.current) vehicleInputRef.current.value = '';
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseFront) {
      alert('Please upload the front image of your driving license.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('licenseFront', licenseFront);
      if (licenseBack) formData.append('licenseBack', licenseBack);
      vehicleFiles.forEach((f) => formData.append('vehicleImages', f));

      Object.entries(form).forEach(([key, val]) => {
        if (val !== '') formData.append(key, val);
      });

      await transportAPI.applyAsDriver(formData);
      await fetchApplication();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="da-page"><div className="da-loading"><div className="da-spinner" /><p>Loading...</p></div></div>
      </>
    );
  }

  /* Already a driver */
  if (isDriver) {
    return (
      <>
        <Navbar />
        <div className="da-page">
          <div className="da-status-card da-approved">
            <FontAwesomeIcon icon={faCheckCircle} className="da-status-icon" />
            <h2>You're an approved driver!</h2>
            <p>Head to your dashboard to create gigs and manage bookings.</p>
            <button className="da-primary-btn" onClick={() => navigate('/driver/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* Existing application */
  if (application) {
    const statusConfig = {
      pending: { icon: faClock, cls: 'da-pending', title: 'Application Pending', desc: 'Your application is under review. We\'ll notify you once a decision is made.' },
      approved: { icon: faCheckCircle, cls: 'da-approved', title: 'Application Approved!', desc: 'Congratulations! You can now create transport gigs.' },
      rejected: { icon: faTimesCircle, cls: 'da-rejected', title: 'Application Not Approved', desc: application.admin_notes || 'Your application was not approved. You may re-apply.' },
    };
    const cfg = statusConfig[application.status];

    return (
      <>
        <Navbar />
        <div className="da-page">
          <div className={`da-status-card ${cfg.cls}`}>
            <FontAwesomeIcon icon={cfg.icon} className="da-status-icon" />
            <h2>{cfg.title}</h2>
            <p>{cfg.desc}</p>
            {application.status === 'approved' && (
              <button className="da-primary-btn" onClick={() => navigate('/driver/dashboard')}>
                Go to Dashboard
              </button>
            )}
            <button className="da-back-btn" onClick={() => navigate('/transport')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Transport
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* Application form */
  return (
    <>
      <Navbar />
      <div className="da-page">
        <div className="da-container">
          <div className="da-header">
            <h1>Become a Driver</h1>
            <p>Join PathFinderSL and start earning by offering transport services across Sri Lanka</p>
          </div>

          {/* Steps indicator */}
          <div className="da-steps">
            <div className={`da-step ${step >= 1 ? 'active' : ''}`}>
              <span className="da-step-num">1</span>
              <span className="da-step-label">License</span>
            </div>
            <div className="da-step-line" />
            <div className={`da-step ${step >= 2 ? 'active' : ''}`}>
              <span className="da-step-num">2</span>
              <span className="da-step-label">Vehicle</span>
            </div>
            <div className="da-step-line" />
            <div className={`da-step ${step >= 3 ? 'active' : ''}`}>
              <span className="da-step-num">3</span>
              <span className="da-step-label">Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="da-form">
            {/* Step 1: License */}
            {step === 1 && (
              <div className="da-form-section">
                <div className="da-section-icon"><FontAwesomeIcon icon={faIdCard} /></div>
                <h2>Driving License</h2>
                <p>Upload clear photos of both sides of your driving license</p>

                {/* Front */}
                <div className="da-form-group">
                  <label>License Front <span className="da-required">*</span></label>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => handleLicenseFile('front', e.target.files[0])}
                  />
                  {!licenseFrontPreview ? (
                    <div
                      className="da-upload-zone"
                      onClick={() => frontInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleLicenseFile('front', e.dataTransfer.files[0]); }}
                    >
                      <FontAwesomeIcon icon={faUpload} className="da-upload-icon" />
                      <p className="da-upload-label">Click or drag &amp; drop</p>
                      <p className="da-upload-hint">JPG, PNG or WEBP · max 5 MB</p>
                    </div>
                  ) : (
                    <div className="da-upload-preview">
                      <img src={licenseFrontPreview} alt="License front" />
                      <button type="button" className="da-upload-clear" onClick={() => clearLicense('front')}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <p className="da-upload-filename">{licenseFront?.name}</p>
                    </div>
                  )}
                </div>

                {/* Back */}
                <div className="da-form-group">
                  <label>License Back <span className="da-optional">(optional)</span></label>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => handleLicenseFile('back', e.target.files[0])}
                  />
                  {!licenseBackPreview ? (
                    <div
                      className="da-upload-zone"
                      onClick={() => backInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleLicenseFile('back', e.dataTransfer.files[0]); }}
                    >
                      <FontAwesomeIcon icon={faUpload} className="da-upload-icon" />
                      <p className="da-upload-label">Click or drag &amp; drop</p>
                      <p className="da-upload-hint">JPG, PNG or WEBP · max 5 MB</p>
                    </div>
                  ) : (
                    <div className="da-upload-preview">
                      <img src={licenseBackPreview} alt="License back" />
                      <button type="button" className="da-upload-clear" onClick={() => clearLicense('back')}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <p className="da-upload-filename">{licenseBack?.name}</p>
                    </div>
                  )}
                </div>

                <div className="da-form-actions">
                  <button type="button" className="da-primary-btn" onClick={() => setStep(2)} disabled={!licenseFront}>
                    Next: Vehicle Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle */}
            {step === 2 && (
              <div className="da-form-section">
                <div className="da-section-icon"><FontAwesomeIcon icon={faCarSide} /></div>
                <h2>Vehicle Information</h2>
                <p>Tell us about your vehicle</p>

                <div className="da-form-row">
                  <div className="da-form-group">
                    <label>Vehicle Type *</label>
                    <select required value={form.vehicle_type} onChange={(e) => handleChange('vehicle_type', e.target.value)}>
                      <option value="">Select type</option>
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="da-form-group">
                    <label>Make *</label>
                    <input type="text" required placeholder="e.g. Toyota" value={form.vehicle_make} onChange={(e) => handleChange('vehicle_make', e.target.value)} />
                  </div>
                </div>

                <div className="da-form-row">
                  <div className="da-form-group">
                    <label>Model *</label>
                    <input type="text" required placeholder="e.g. Prius" value={form.vehicle_model} onChange={(e) => handleChange('vehicle_model', e.target.value)} />
                  </div>
                  <div className="da-form-group">
                    <label>Year</label>
                    <input type="number" min="1990" max={new Date().getFullYear() + 1} placeholder="e.g. 2022" value={form.vehicle_year} onChange={(e) => handleChange('vehicle_year', e.target.value)} />
                  </div>
                </div>

                <div className="da-form-row">
                  <div className="da-form-group">
                    <label>License Plate *</label>
                    <input type="text" required placeholder="e.g. ABC-1234" value={form.vehicle_plate} onChange={(e) => handleChange('vehicle_plate', e.target.value)} />
                  </div>
                  <div className="da-form-group">
                    <label>Color</label>
                    <input type="text" placeholder="e.g. White" value={form.vehicle_color} onChange={(e) => handleChange('vehicle_color', e.target.value)} />
                  </div>
                </div>

                <div className="da-form-group">
                  <label>Passenger Capacity *</label>
                  <input type="number" required min="1" max="50" placeholder="e.g. 4" value={form.passenger_capacity} onChange={(e) => handleChange('passenger_capacity', e.target.value)} />
                </div>

                <div className="da-form-actions">
                  <button type="button" className="da-back-btn" onClick={() => setStep(1)}>Back</button>
                  <button
                    type="button"
                    className="da-primary-btn"
                    onClick={() => setStep(3)}
                    disabled={!form.vehicle_type || !form.vehicle_make || !form.vehicle_model || !form.vehicle_plate || !form.passenger_capacity}
                  >
                    Next: Photos & Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Photos & Review */}
            {step === 3 && (
              <div className="da-form-section">
                <div className="da-section-icon"><FontAwesomeIcon icon={faCameraRetro} /></div>
                <h2>Photos & Description</h2>
                <p>Add up to 5 vehicle photos and a description</p>

                {/* Vehicle image upload */}
                <div className="da-form-group">
                  <label>
                    Vehicle Photos <span className="da-optional">(up to 5)</span>
                  </label>
                  <input
                    ref={vehicleInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleVehicleFiles(e.target.files)}
                  />

                  {/* Preview grid */}
                  {vehiclePreviews.length > 0 && (
                    <div className="da-vehicle-grid">
                      {vehiclePreviews.map((src, idx) => (
                        <div key={idx} className="da-vehicle-thumb">
                          <img src={src} alt={`Vehicle ${idx + 1}`} />
                          <button
                            type="button"
                            className="da-upload-clear"
                            onClick={() => removeVehicleImage(idx)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add more zone — only show if under limit */}
                  {vehicleFiles.length < 5 && (
                    <div
                      className="da-upload-zone"
                      style={{ marginTop: vehiclePreviews.length ? '0.75rem' : 0 }}
                      onClick={() => vehicleInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleVehicleFiles(e.dataTransfer.files); }}
                    >
                      <FontAwesomeIcon icon={faUpload} className="da-upload-icon" />
                      <p className="da-upload-label">
                        {vehicleFiles.length === 0 ? 'Click or drag & drop vehicle photos' : `Add more (${vehicleFiles.length}/5)`}
                      </p>
                      <p className="da-upload-hint">JPG, PNG or WEBP · max 8 MB each</p>
                    </div>
                  )}
                </div>

                <div className="da-form-group">
                  <label>Vehicle Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your vehicle condition, features, AC, etc."
                    value={form.vehicle_description}
                    onChange={(e) => handleChange('vehicle_description', e.target.value)}
                  />
                </div>

                {/* Summary */}
                <div className="da-summary">
                  <h3>Application Summary</h3>
                  <div className="da-summary-grid">
                    <div><strong>Vehicle:</strong> {form.vehicle_make} {form.vehicle_model} ({form.vehicle_type})</div>
                    <div><strong>Plate:</strong> {form.vehicle_plate}</div>
                    <div><strong>Year:</strong> {form.vehicle_year || 'N/A'}</div>
                    <div><strong>Capacity:</strong> {form.passenger_capacity} passengers</div>
                    <div><strong>Photos:</strong> {vehicleFiles.length} uploaded</div>
                  </div>
                </div>

                <div className="da-form-actions">
                  <button type="button" className="da-back-btn" onClick={() => setStep(2)}>Back</button>
                  <button type="submit" className="da-primary-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DriverApply;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCarSide, faCalendarDays, faLocationDot, faUsers, faMoneyBillWave,
  faPenToSquare, faTimes, faCircleCheck, faClock, faCircleXmark,
  faFlagCheckered, faArrowRight, faRotateLeft, faUserTie, faRoute,
  faChevronRight, faRoad, faHourglass, faNoteSticky, faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { transportAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './MyVehicleBookings.css';

/* ── Fix Leaflet default icons (CDN approach used project-wide) ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

/* ── Sri Lanka known coordinates ── */
const SL_LOCATIONS = {
  'colombo': [6.9271, 79.8612], 'kandy': [7.2906, 80.6337], 'galle': [6.0535, 80.2210],
  'airport': [7.1801, 79.8841], 'bandaranaike': [7.1801, 79.8841], 'bia': [7.1801, 79.8841],
  'negombo': [7.2008, 79.8737], 'ella': [6.8667, 81.0469], 'sigiriya': [7.9570, 80.7603],
  'nuwara eliya': [6.9497, 80.7891], 'trincomalee': [8.5874, 81.2152],
  'jaffna': [9.6615, 80.0255], 'anuradhapura': [8.3114, 80.4037],
  'polonnaruwa': [7.9403, 81.0188], 'dambulla': [7.8731, 80.6517],
  'matara': [5.9549, 80.5550], 'hikkaduwa': [6.1395, 80.1063],
  'unawatuna': [6.0174, 80.2490], 'mirissa': [5.9485, 80.4718],
  'bentota': [6.4213, 79.9996], 'arugam bay': [6.8406, 81.8322],
  'batticaloa': [7.7310, 81.6924], 'hambantota': [6.1243, 81.1185],
  'yala': [6.3728, 81.5185], 'udawalawe': [6.4289, 80.8834],
  'pinnawala': [7.3005, 80.3880], 'ratnapura': [6.6828, 80.3992],
  'kurunegala': [7.4863, 80.3623], 'matale': [7.4675, 80.6234],
  'badulla': [6.9934, 81.0550], 'habarana': [8.0362, 80.7527],
  'tissamaharama': [6.2845, 81.2868], 'kalutara': [6.5854, 79.9607],
  'kalpitiya': [8.2333, 79.7667], 'weligama': [5.9745, 80.4296],
  'tangalle': [6.0238, 80.7950], 'mount lavinia': [6.8380, 79.8666],
  'minneriya': [7.9975, 80.8642], 'wilpattu': [8.4505, 80.0136],
};
const SRI_LANKA_CENTER = [7.8731, 80.7718];

const geocodeLocation = async (name) => {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(SL_LOCATIONS)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ', Sri Lanka')}&format=json&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch { /* ignore */ }
  return null;
};

const fetchRoute = async (start, end) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distance = (data.routes[0].distance / 1000).toFixed(1);
      const duration = Math.round(data.routes[0].duration / 60);
      return { coords, distance, duration };
    }
  } catch { /* ignore */ }
  return { coords: [start, end], distance: null, duration: null };
};

function MapFitter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [bounds, map]);
  return null;
}

const STATUS_META = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: faClock },
  confirmed: { label: 'Confirmed', color: '#16a34a', bg: '#dcfce7', border: '#86efac', icon: faCircleCheck },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: faCircleXmark },
  completed: { label: 'Completed', color: '#0c618a', bg: '#e0f2fe', border: '#7dd3fc', icon: faFlagCheckered },
};

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function calcDays(start, end) {
  return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyVehicleBookings() {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('all');
  const [selectedId, setSelectedId]   = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError]             = useState('');

  // Map state
  const [mapMarkers, setMapMarkers]       = useState({ pickup: null, dropoff: null });
  const [routePath, setRoutePath]         = useState([]);
  const [routeInfo, setRouteInfo]         = useState(null);
  const [mapLoading, setMapLoading]       = useState(false);
  const [mapKey, setMapKey]               = useState(0);
  const geocodeCache                      = useRef({});

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await transportAPI.getMyBookings();
      const list = res.data || [];
      setBookings(list);
      if (list.length > 0) setSelectedId(list[0].id);
    } catch {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Geocode when selection changes ── */
  useEffect(() => {
    if (!selectedId) return;
    const booking = bookings.find((b) => b.id === selectedId);
    if (!booking) return;

    const load = async () => {
      setMapLoading(true);
      setMapMarkers({ pickup: null, dropoff: null });
      setRoutePath([]);
      setRouteInfo(null);

      const geocode = async (loc) => {
        if (!loc) return null;
        if (geocodeCache.current[loc]) return geocodeCache.current[loc];
        const coords = await geocodeLocation(loc);
        if (coords) geocodeCache.current[loc] = coords;
        return coords;
      };

      const [pickup, dropoff] = await Promise.all([
        geocode(booking.pickup_location),
        geocode(booking.dropoff_location),
      ]);

      setMapMarkers({ pickup, dropoff });

      if (pickup && dropoff) {
        const route = await fetchRoute(pickup, dropoff);
        setRoutePath(route.coords);
        setRouteInfo({ distance: route.distance, duration: route.duration });
      }

      setMapKey((k) => k + 1);
      setMapLoading(false);
    };

    load();
  }, [selectedId, bookings]);

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditForm({
      start_date: booking.start_date,
      end_date: booking.end_date,
      passenger_count: String(booking.passenger_count),
      pickup_location: booking.pickup_location,
      dropoff_location: booking.dropoff_location,
      notes: booking.notes || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSaveEdit = async (booking) => {
    if (!editForm.start_date || !editForm.end_date || !editForm.pickup_location || !editForm.dropoff_location) {
      alert('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const res = await transportAPI.updateBooking(booking.id, {
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        passenger_count: parseInt(editForm.passenger_count),
        pickup_location: editForm.pickup_location,
        dropoff_location: editForm.dropoff_location,
        notes: editForm.notes || null,
      });
      const updated = res.data;
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
      setEditingId(null);
    } catch (err) {
      alert(err?.message || 'Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      await transportAPI.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch {
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered      = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);
  const tabCount      = (t) => (t === 'all' ? bookings.length : bookings.filter((b) => b.status === t).length);
  const selectedBooking = bookings.find((b) => b.id === selectedId) || null;
  const isEditing     = editingId === selectedId;
  const days          = selectedBooking ? calcDays(selectedBooking.start_date, selectedBooking.end_date) : 1;
  const editDays      = isEditing && editForm.start_date && editForm.end_date
    ? calcDays(editForm.start_date, editForm.end_date) : days;

  const mapBounds = [mapMarkers.pickup, mapMarkers.dropoff].filter(Boolean);

  return (
    <>
      <Navbar />
      <div className="mvb-page">

        {/* ── Page header ── */}
        <div className="mvb-page-header">
          <div className="mvb-header__icon-wrap">
            <FontAwesomeIcon icon={faCarSide} />
          </div>
          <div>
            <h1 className="mvb-title">My Vehicle Bookings</h1>
            <p className="mvb-subtitle">View and manage your transport reservations</p>
          </div>
          <Link to="/transport" className="mvb-browse-btn">Browse Transport</Link>
        </div>

        {error && <div className="mvb-alert">{error}</div>}

        {/* ── Status tabs ── */}
        <div className="mvb-tabs">
          {TABS.map((t) => {
            const meta = STATUS_META[t];
            return (
              <button
                key={t}
                className={`mvb-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
                style={tab === t && meta ? { background: meta.color, borderColor: meta.color } : undefined}
              >
                {meta && <FontAwesomeIcon icon={meta.icon} />}
                {t === 'all' ? 'All' : meta.label}
                <span className="mvb-tab__badge">{tabCount(t)}</span>
              </button>
            );
          })}
        </div>

        {/* ── Split layout ── */}
        {loading ? (
          <div className="mvb-loading">
            <div className="mvb-spinner" />
            Loading your bookings…
          </div>
        ) : bookings.length === 0 ? (
          <div className="mvb-empty-full">
            <FontAwesomeIcon icon={faCarSide} className="mvb-empty__icon" />
            <h3>No vehicle bookings yet</h3>
            <p>Book a vehicle to get started.</p>
            <Link to="/transport" className="mvb-empty__btn">Explore Transport Options</Link>
          </div>
        ) : (
          <div className="mvb-split">

            {/* ──────────── LEFT: booking list ──────────── */}
            <div className="mvb-left">
              {filtered.length === 0 ? (
                <div className="mvb-left-empty">
                  <p>No {tab} bookings.</p>
                </div>
              ) : (
                filtered.map((b) => {
                  const sm = STATUS_META[b.status] || STATUS_META.pending;
                  const d  = calcDays(b.start_date, b.end_date);
                  const isSelected = selectedId === b.id;
                  return (
                    <div
                      key={b.id}
                      className={`mvb-item ${isSelected ? 'mvb-item--active' : ''}`}
                      style={{ borderLeftColor: sm.color }}
                      onClick={() => { setSelectedId(b.id); setEditingId(null); }}
                    >
                      <div className="mvb-item__top">
                        <span className="mvb-item__title">
                          {b.gig?.title || 'Vehicle Service'}
                        </span>
                        <span
                          className="mvb-item__badge"
                          style={{ background: sm.bg, color: sm.color }}
                        >
                          <FontAwesomeIcon icon={sm.icon} />
                          {sm.label}
                        </span>
                      </div>
                      {b.gig?.vehicle_type && (
                        <span className="mvb-item__type">{b.gig.vehicle_type}</span>
                      )}
                      <div className="mvb-item__dates">
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {fmt(b.start_date)} → {fmt(b.end_date)}
                        <span className="mvb-item__days">{d}d</span>
                      </div>
                      <div className="mvb-item__footer">
                        <span className="mvb-item__price">
                          {b.currency} {parseFloat(b.total_price).toLocaleString()}
                        </span>
                        {isSelected && (
                          <FontAwesomeIcon icon={faChevronRight} className="mvb-item__arrow" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ──────────── RIGHT: detail panel ──────────── */}
            <div className="mvb-right">
              {!selectedBooking ? (
                <div className="mvb-detail-empty">
                  <FontAwesomeIcon icon={faCarSide} />
                  <p>Select a booking to view details</p>
                </div>
              ) : (() => {
                const sm = STATUS_META[selectedBooking.status] || STATUS_META.pending;
                const canAct = selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed';

                return (
                  <>
                    {/* ── Map section ── */}
                    <div className="mvb-map-wrap">
                      {mapLoading && (
                        <div className="mvb-map-overlay">
                          <div className="mvb-spinner" />
                          <span>Locating route…</span>
                        </div>
                      )}
                      <MapContainer
                        key={mapKey}
                        center={SRI_LANKA_CENTER}
                        zoom={8}
                        className="mvb-map"
                        scrollWheelZoom={true}
                        zoomControl={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {mapBounds.length >= 2 && <MapFitter bounds={mapBounds} />}
                        {mapMarkers.pickup && (
                          <Marker position={mapMarkers.pickup} icon={pickupIcon}>
                            <Popup>
                              <strong>Pickup</strong><br />{selectedBooking.pickup_location}
                            </Popup>
                          </Marker>
                        )}
                        {mapMarkers.dropoff && (
                          <Marker position={mapMarkers.dropoff} icon={dropoffIcon}>
                            <Popup>
                              <strong>Dropoff</strong><br />{selectedBooking.dropoff_location}
                            </Popup>
                          </Marker>
                        )}
                        {routePath.length > 1 && (
                          <Polyline positions={routePath} color="#0c618a" weight={4} opacity={0.75} dashArray="8,4" />
                        )}
                      </MapContainer>

                      {/* Route stats chips */}
                      {routeInfo && (
                        <div className="mvb-route-stats">
                          {routeInfo.distance && (
                            <span className="mvb-route-chip">
                              <FontAwesomeIcon icon={faRoad} /> {routeInfo.distance} km
                            </span>
                          )}
                          {routeInfo.duration && (
                            <span className="mvb-route-chip">
                              <FontAwesomeIcon icon={faHourglass} /> ~{routeInfo.duration} min
                            </span>
                          )}
                        </div>
                      )}

                      {/* Legend */}
                      <div className="mvb-map-legend">
                        <span className="mvb-legend-item mvb-legend--pickup">Pickup</span>
                        <span className="mvb-legend-item mvb-legend--dropoff">Dropoff</span>
                      </div>
                    </div>

                    {/* ── Detail content ── */}
                    <div className="mvb-detail-body">

                      {/* Header */}
                      <div className="mvb-detail-header" style={{ borderLeftColor: sm.color }}>
                        <div className="mvb-detail-title-row">
                          <span className="mvb-detail-title">
                            {selectedBooking.gig?.title || 'Vehicle Service'}
                          </span>
                          {selectedBooking.gig?.vehicle_type && (
                            <span className="mvb-detail-vtype">{selectedBooking.gig.vehicle_type}</span>
                          )}
                        </div>
                        <span
                          className="mvb-status-badge"
                          style={{ background: sm.bg, color: sm.color, borderColor: sm.border }}
                        >
                          <FontAwesomeIcon icon={sm.icon} /> {sm.label}
                        </span>
                      </div>

                      {/* Driver */}
                      {selectedBooking.driver && (
                        <div className="mvb-detail-driver">
                          <div className="mvb-driver-avatar">
                            {selectedBooking.driver.profile_picture
                              ? <img src={selectedBooking.driver.profile_picture} alt={selectedBooking.driver.full_name} />
                              : <FontAwesomeIcon icon={faUserTie} />
                            }
                          </div>
                          <div>
                            <div className="mvb-driver-label">Driver</div>
                            <div className="mvb-driver-name">{selectedBooking.driver.full_name}</div>
                          </div>
                          <FontAwesomeIcon icon={faIdCard} className="mvb-detail-driver__icon" />
                        </div>
                      )}

                      {/* Info grid */}
                      <div className="mvb-info-grid">
                        <div className="mvb-info-block">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faCalendarDays} /> Start Date
                          </div>
                          <div className="mvb-info-value">{fmt(selectedBooking.start_date)}</div>
                        </div>
                        <div className="mvb-info-block">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faCalendarDays} /> End Date
                          </div>
                          <div className="mvb-info-value">{fmt(selectedBooking.end_date)}</div>
                        </div>
                        <div className="mvb-info-block">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faRoute} /> Duration
                          </div>
                          <div className="mvb-info-value">{days} day{days !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="mvb-info-block">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faUsers} /> Passengers
                          </div>
                          <div className="mvb-info-value">{selectedBooking.passenger_count}</div>
                        </div>
                        <div className="mvb-info-block mvb-info-block--full">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faLocationDot} style={{ color: '#16a34a' }} /> Pickup Location
                          </div>
                          <div className="mvb-info-value">{selectedBooking.pickup_location}</div>
                        </div>
                        <div className="mvb-info-block mvb-info-block--full">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faLocationDot} style={{ color: '#dc2626' }} /> Dropoff Location
                          </div>
                          <div className="mvb-info-value">{selectedBooking.dropoff_location}</div>
                        </div>
                        <div className="mvb-info-block">
                          <div className="mvb-info-label">
                            <FontAwesomeIcon icon={faMoneyBillWave} /> Total Price
                          </div>
                          <div className="mvb-info-value mvb-info-value--price">
                            {selectedBooking.currency} {parseFloat(selectedBooking.total_price).toLocaleString()}
                          </div>
                        </div>
                        {selectedBooking.gig?.price_per_day && (
                          <div className="mvb-info-block">
                            <div className="mvb-info-label">Rate / Day</div>
                            <div className="mvb-info-value">
                              {selectedBooking.currency} {parseFloat(selectedBooking.gig.price_per_day).toLocaleString()}
                            </div>
                          </div>
                        )}
                        {selectedBooking.notes && (
                          <div className="mvb-info-block mvb-info-block--full">
                            <div className="mvb-info-label">
                              <FontAwesomeIcon icon={faNoteSticky} /> Notes
                            </div>
                            <div className="mvb-info-value mvb-info-value--notes">{selectedBooking.notes}</div>
                          </div>
                        )}
                      </div>

                      {/* ── Action buttons (view mode) ── */}
                      {canAct && !isEditing && (
                        <div className="mvb-detail-actions">
                          <button className="mvb-btn mvb-btn--edit" onClick={() => startEdit(selectedBooking)}>
                            <FontAwesomeIcon icon={faPenToSquare} /> Edit Booking
                          </button>
                          <button
                            className="mvb-btn mvb-btn--cancel"
                            onClick={() => handleCancel(selectedBooking.id)}
                            disabled={cancellingId === selectedBooking.id}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            {cancellingId === selectedBooking.id ? 'Cancelling…' : 'Cancel Booking'}
                          </button>
                        </div>
                      )}

                      {/* ── Edit form ── */}
                      {isEditing && (
                        <div className="mvb-edit-form">
                          <div className="mvb-edit-notice">
                            <FontAwesomeIcon icon={faRotateLeft} />
                            Saving changes will reset the status to <strong>Pending</strong> for driver confirmation.
                          </div>
                          <div className="mvb-edit-grid">
                            <label className="mvb-field">
                              <span>Start Date</span>
                              <input type="date" value={editForm.start_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))} />
                            </label>
                            <label className="mvb-field">
                              <span>End Date</span>
                              <input type="date" value={editForm.end_date}
                                min={editForm.start_date || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} />
                            </label>
                            <label className="mvb-field">
                              <span>Passengers</span>
                              <input type="number" min="1" max={selectedBooking.gig?.passenger_capacity || 50}
                                value={editForm.passenger_count}
                                onChange={(e) => setEditForm((f) => ({ ...f, passenger_count: e.target.value }))} />
                            </label>
                            <label className="mvb-field">
                              <span>Pickup Location</span>
                              <input type="text" value={editForm.pickup_location} placeholder="e.g. Colombo Airport"
                                onChange={(e) => setEditForm((f) => ({ ...f, pickup_location: e.target.value }))} />
                            </label>
                            <label className="mvb-field">
                              <span>Dropoff Location</span>
                              <input type="text" value={editForm.dropoff_location} placeholder="e.g. Kandy"
                                onChange={(e) => setEditForm((f) => ({ ...f, dropoff_location: e.target.value }))} />
                            </label>
                            <label className="mvb-field mvb-field--full">
                              <span>Notes (optional)</span>
                              <textarea rows="2" value={editForm.notes} placeholder="Any special requests…"
                                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} />
                            </label>
                          </div>

                          {selectedBooking.gig?.price_per_day && editForm.start_date && editForm.end_date && (
                            <div className="mvb-price-preview">
                              <span>
                                {editDays} day{editDays !== 1 ? 's' : ''} × {selectedBooking.currency}{' '}
                                {parseFloat(selectedBooking.gig.price_per_day).toLocaleString()}
                              </span>
                              <strong>
                                {selectedBooking.currency}{' '}
                                {(editDays * parseFloat(selectedBooking.gig.price_per_day)).toLocaleString()}
                              </strong>
                            </div>
                          )}

                          <div className="mvb-edit-actions">
                            <button className="mvb-btn mvb-btn--save" onClick={() => handleSaveEdit(selectedBooking)} disabled={saving}>
                              {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button className="mvb-btn mvb-btn--ghost" onClick={cancelEdit}>Discard</button>
                          </div>
                        </div>
                      )}

                    </div>{/* end mvb-detail-body */}
                  </>
                );
              })()}
            </div>{/* end mvb-right */}

          </div>
        )}
      </div>
      <Footer />
    </>
  );
}



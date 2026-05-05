import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCarSide, faCalendarDays, faChartLine, faPlus, faPenToSquare, faTrash,
  faCheck, faTimes, faChevronLeft, faChevronRight, faUsers, faMoneyBill,
  faClipboardList, faClock, faArrowRight, faCircleCheck, faLocationDot,
  faUpload, faX, faStar, faRoute, faGaugeHigh, faVanShuttle, faBars,
  faMap, faEye, faPhone, faEnvelope, faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { transportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './DriverDashboard.css';

/* ── Fix Leaflet default marker icons ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

/* ── Sri Lanka Location Coordinates ── */
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
  'pinnawala': [7.3005, 80.3880], 'horton plains': [6.8019, 80.8033],
  'ratnapura': [6.6828, 80.3992], 'kurunegala': [7.4863, 80.3623],
  'matale': [7.4675, 80.6234], 'badulla': [6.9934, 81.0550],
  'habarana': [8.0362, 80.7527], 'tissamaharama': [6.2845, 81.2868],
  'kalutara': [6.5854, 79.9607], 'chilaw': [7.5758, 79.7953],
  'kalpitiya': [8.2333, 79.7667], 'mannar': [8.9810, 79.9044],
  'wilpattu': [8.4505, 80.0136], 'minneriya': [7.9975, 80.8642],
  'pasikuda': [7.9167, 81.5667], 'weligama': [5.9745, 80.4296],
  'tangalle': [6.0238, 80.7950], 'mount lavinia': [6.8380, 79.8666],
};

const SRI_LANKA_CENTER = [7.8731, 80.7718];

/* ── Geocode location name to coordinates ── */
const geocodeLocation = async (name) => {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(SL_LOCATIONS)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  try {
    const encoded = encodeURIComponent(name + ', Sri Lanka');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`);
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (e) { /* ignore */ }
  return null;
};

/* ── Fetch road route from OSRM ── */
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
  } catch (e) { /* ignore */ }
  return { coords: [start, end], distance: null, duration: null };
};

/* ── Map auto-fit component ── */
const MapFitter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [bounds, map]);
  return null;
};

const VEHICLE_CATEGORIES = ['Small Group (1-4)', 'Medium Group (5-7)', 'Large Group (8-30+)', 'Specialized'];
const VEHICLE_TYPES = [
  'Hatchback', 'Sedan', 'Luxury Car', 'SUV', '4WD', 'MPV/Minivan',
  'Passenger Van', 'Mini Coach', 'Tour Bus', 'Campervan', 'Open-top Safari', 'Convertible',
];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDriver } = useAuth();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  /* Gig form */
  const [showGigForm, setShowGigForm] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [gigForm, setGigForm] = useState({
    title: '', description: '', start_location: '', end_location: '',
    vehicle_category: '', vehicle_type: '', vehicle_make: '', vehicle_model: '',
    passenger_capacity: '', price_per_day: '', currency: 'LKR',
    available_from: '', available_to: '', status: 'active',
  });
  const [gigErrors, setGigErrors] = useState({});
  const [gigImages, setGigImages] = useState([]);
  const [gigImagePreviews, setGigImagePreviews] = useState([]);
  const gigImageInputRef = useRef(null);
  const [gigSubmitting, setGigSubmitting] = useState(false);

  /* Calendar */
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);

  /* Map state */
  const [mapRoute, setMapRoute] = useState(null);
  const [mapStart, setMapStart] = useState(null);
  const [mapEnd, setMapEnd] = useState(null);
  const [mapInfo, setMapInfo] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/userlogin'); return; }
    if (!isDriver) { navigate('/driver/apply'); return; }
    fetchAll();
  }, [isAuthenticated, isDriver]);

  const fetchAll = () => { fetchStats(); fetchGigs(); fetchBookings(); };

  const fetchStats = async () => {
    setLoadingStats(true);
    try { const r = await transportAPI.getDriverStats(); setStats(r.data); }
    catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  };

  const fetchGigs = async () => {
    setLoadingGigs(true);
    try { const r = await transportAPI.getMyGigs(); setGigs(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoadingGigs(false); }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try { const r = await transportAPI.getDriverBookings(); setBookings(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoadingBookings(false); }
  };

  /* ── Map route loading ── */
  const loadRoute = useCallback(async (startLoc, endLoc) => {
    setMapRoute(null); setMapStart(null); setMapEnd(null); setMapInfo(null);
    const [s, e] = await Promise.all([geocodeLocation(startLoc), geocodeLocation(endLoc)]);
    if (s) setMapStart(s);
    if (e) setMapEnd(e);
    if (s && e) {
      const route = await fetchRoute(s, e);
      setMapRoute(route.coords);
      setMapInfo({ distance: route.distance, duration: route.duration, from: startLoc, to: endLoc });
    }
  }, []);

  /* Load route when form locations change (debounced) */
  const formRouteTimer = useRef(null);
  useEffect(() => {
    if (!showGigForm) return;
    if (formRouteTimer.current) clearTimeout(formRouteTimer.current);
    if (gigForm.start_location && gigForm.end_location) {
      formRouteTimer.current = setTimeout(() => loadRoute(gigForm.start_location, gigForm.end_location), 800);
    }
    return () => clearTimeout(formRouteTimer.current);
  }, [gigForm.start_location, gigForm.end_location, showGigForm, loadRoute]);

  /* Show route when a booking is selected */
  const selectBooking = useCallback((b) => {
    setSelectedBooking(b);
    setSelectedGig(null);
    loadRoute(b.pickup_location || b.gig?.start_location, b.dropoff_location || b.gig?.end_location);
  }, [loadRoute]);

  /* Show route when a gig is selected */
  const selectGig = useCallback((g) => {
    setSelectedGig(g);
    setSelectedBooking(null);
    loadRoute(g.start_location, g.end_location);
  }, [loadRoute]);

  /* Gig CRUD */
  const validateGigForm = () => {
    const errors = {};
    const title = gigForm.title.trim();
    if (!title) errors.title = 'Title is required.';
    else if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
    else if (title.length > 200) errors.title = 'Title must be 200 characters or less.';

    if (!gigForm.start_location.trim()) errors.start_location = 'Start location is required.';
    if (!gigForm.end_location.trim()) errors.end_location = 'End location is required.';

    if (!gigForm.vehicle_category) errors.vehicle_category = 'Vehicle category is required.';
    if (!gigForm.vehicle_type) errors.vehicle_type = 'Vehicle type is required.';

    const cap = parseInt(gigForm.passenger_capacity);
    if (!gigForm.passenger_capacity) errors.passenger_capacity = 'Passenger capacity is required.';
    else if (isNaN(cap) || cap < 1) errors.passenger_capacity = 'Capacity must be at least 1.';
    else if (cap > 50) errors.passenger_capacity = 'Capacity cannot exceed 50.';

    const price = parseFloat(gigForm.price_per_day);
    if (!gigForm.price_per_day && gigForm.price_per_day !== 0) errors.price_per_day = 'Price per day is required.';
    else if (isNaN(price) || price < 0) errors.price_per_day = 'Price must be a positive number.';

    if (gigForm.description && gigForm.description.length > 3000)
      errors.description = 'Description must be 3000 characters or less.';

    if (gigForm.vehicle_make && gigForm.vehicle_make.length > 60)
      errors.vehicle_make = 'Make must be 60 characters or less.';
    if (gigForm.vehicle_model && gigForm.vehicle_model.length > 60)
      errors.vehicle_model = 'Model must be 60 characters or less.';

    if (gigForm.available_from && gigForm.available_to) {
      if (new Date(gigForm.available_to) < new Date(gigForm.available_from))
        errors.available_to = '"Available To" must be on or after "Available From".';
    }

    return errors;
  };

  const resetGigForm = () => {
    setGigForm({
      title: '', description: '', start_location: '', end_location: '',
      vehicle_category: '', vehicle_type: '', vehicle_make: '', vehicle_model: '',
      passenger_capacity: '', price_per_day: '', currency: 'LKR',
      available_from: '', available_to: '', status: 'active',
    });
    setGigErrors({});
    setGigImages([]); setGigImagePreviews([]);
    if (gigImageInputRef.current) gigImageInputRef.current.value = '';
    setEditingGig(null); setShowGigForm(false);
    setMapRoute(null); setMapStart(null); setMapEnd(null); setMapInfo(null);
  };

  const openEditGig = (g) => {
    setEditingGig(g);
    setGigForm({
      title: g.title, description: g.description || '', start_location: g.start_location,
      end_location: g.end_location, vehicle_category: g.vehicle_category,
      vehicle_type: g.vehicle_type, vehicle_make: g.vehicle_make || '',
      vehicle_model: g.vehicle_model || '', passenger_capacity: g.passenger_capacity,
      price_per_day: g.price_per_day, currency: g.currency || 'LKR',
      available_from: g.available_from || '',
      available_to: g.available_to || '', status: g.status,
    });
    setGigImages([]);
    setGigImagePreviews([]);
    setShowGigForm(true);
  };

  const handleGigImages = (newFiles) => {
    const remaining = 5 - gigImages.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(newFiles).slice(0, remaining);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setGigImages((p) => [...p, ...toAdd]);
    setGigImagePreviews((p) => [...p, ...previews]);
  };

  const removeGigImage = (idx) => {
    setGigImages((p) => p.filter((_, i) => i !== idx));
    setGigImagePreviews((p) => p.filter((_, i) => i !== idx));
    if (gigImageInputRef.current) gigImageInputRef.current.value = '';
  };

  const submitGig = async (e) => {
    e.preventDefault();
    const errors = validateGigForm();
    if (Object.keys(errors).length > 0) {
      setGigErrors(errors);
      return;
    }
    setGigErrors({});
    setGigSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(gigForm).forEach(([key, val]) => {
        if (key === 'passenger_capacity') formData.append(key, parseInt(val));
        else if (key === 'price_per_day') formData.append(key, parseFloat(val));
        else formData.append(key, val || '');
      });
      gigImages.forEach((file) => formData.append('gigImages', file));
      if (editingGig) await transportAPI.updateGig(editingGig.id, formData);
      else await transportAPI.createGig(formData);
      resetGigForm(); fetchGigs(); fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save gig');
    } finally { setGigSubmitting(false); }
  };

  const deleteGig = async (id) => {
    if (!confirm('Delete this gig?')) return;
    try { await transportAPI.deleteGig(id); fetchGigs(); fetchStats(); }
    catch (e) { alert('Failed to delete gig'); }
  };

  /* Booking actions */
  const handleBookingAction = async (id, status) => {
    try { await transportAPI.updateBookingStatus(id, status); fetchBookings(); fetchStats(); }
    catch (e) { alert('Failed to update booking'); }
  };

  /* Calendar logic */
  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calMonth, calYear]);

  const bookedDates = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      const s = new Date(b.start_date);
      const e = new Date(b.end_date);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(b);
      }
    });
    return map;
  }, [bookings]);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  /* Handle calendar date click */
  const handleDateClick = (date, dayBookings) => {
    if (dayBookings.length === 0) return;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedBookings(dayBookings);
    selectBooking(dayBookings[0]);
  };

  /* Monthly revenue chart data */
  const chartData = useMemo(() => {
    if (!stats?.monthlyRevenue) return [];
    const entries = Object.entries(stats.monthlyRevenue).sort();
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);
    return entries.map(([month, value]) => ({
      month: month.slice(5),
      value,
      pct: (value / maxVal) * 100,
    }));
  }, [stats]);

  /* Active bookings for the top strip */
  const activeBookings = useMemo(() => bookings.filter(b => b.status === 'pending' || b.status === 'confirmed'), [bookings]);

  const mapBounds = useMemo(() => {
    const pts = [];
    if (mapStart) pts.push(mapStart);
    if (mapEnd) pts.push(mapEnd);
    if (mapRoute) pts.push(...mapRoute);
    return pts.length >= 2 ? pts : null;
  }, [mapStart, mapEnd, mapRoute]);

  const TABS = [
    { key: 'overview', icon: faGaugeHigh, label: 'Dashboard' },
    { key: 'gigs', icon: faCarSide, label: 'My Gigs' },
    { key: 'bookings', icon: faClipboardList, label: 'Bookings' },
    { key: 'calendar', icon: faCalendarDays, label: 'Calendar' },
  ];

  return (
    <>
      <Navbar />
      <div className="dd-layout">
        {/* ══ Sidebar ══ */}
        <aside className={`dd-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="dd-sidebar-header">
            <FontAwesomeIcon icon={faVanShuttle} className="dd-sidebar-logo" />
            {sidebarOpen && <span>Driver Hub</span>}
          </div>
          <nav className="dd-sidebar-nav">
            {TABS.map((t) => (
              <button key={t.key} className={`dd-nav-item ${tab === t.key ? 'active' : ''}`}
                onClick={() => { setTab(t.key); setShowGigForm(false); }}>
                <FontAwesomeIcon icon={t.icon} />
                {sidebarOpen && <span>{t.label}</span>}
              </button>
            ))}
          </nav>
          {sidebarOpen && stats && (
            <div className="dd-sidebar-stats">
              <div className="dd-mini-stat">
                <span className="dd-mini-val">{stats.activeGigs || 0}</span>
                <span className="dd-mini-lbl">Active Gigs</span>
              </div>
              <div className="dd-mini-stat">
                <span className="dd-mini-val">{stats.pendingBookings || 0}</span>
                <span className="dd-mini-lbl">Pending</span>
              </div>
              <div className="dd-mini-stat">
                <span className="dd-mini-val">LKR {(stats.totalRevenue || 0).toLocaleString()}</span>
                <span className="dd-mini-lbl">Revenue</span>
              </div>
            </div>
          )}
        </aside>

        {/* ══ Main Content ══ */}
        <main className="dd-main">
          {/* Top Bar */}
          <header className="dd-topbar">
            <div className="dd-topbar-left">
              <button className="dd-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <FontAwesomeIcon icon={faBars} />
              </button>
              <h1>
                {tab === 'overview' && 'Dashboard'}
                {tab === 'gigs' && (showGigForm ? (editingGig ? 'Edit Gig' : 'New Gig') : 'My Gigs')}
                {tab === 'bookings' && 'Bookings'}
                {tab === 'calendar' && 'Calendar'}
              </h1>
            </div>
            <div className="dd-topbar-right">
              {tab === 'gigs' && !showGigForm && (
                <button className="dd-add-btn" onClick={() => { resetGigForm(); setShowGigForm(true); }}>
                  <FontAwesomeIcon icon={faPlus} /> New Gig
                </button>
              )}
              <div className="dd-topbar-chips">
                <span className="dd-chip dd-chip--blue">
                  <FontAwesomeIcon icon={faCarSide} /> {stats?.activeGigs || 0} Gigs
                </span>
                <span className="dd-chip dd-chip--amber">
                  <FontAwesomeIcon icon={faClock} /> {stats?.pendingBookings || 0} Pending
                </span>
              </div>
            </div>
          </header>

          {/* ── Active Bookings Strip ── */}
          {activeBookings.length > 0 && (tab === 'overview' || tab === 'bookings') && (
            <div className="dd-booking-strip">
              <div className="dd-strip-scroll">
                {activeBookings.map((b) => (
                  <div key={b.id}
                    className={`dd-strip-card ${selectedBooking?.id === b.id ? 'selected' : ''} dd-strip--${b.status}`}
                    onClick={() => selectBooking(b)}>
                    <div className="dd-strip-top">
                      <span className="dd-strip-id">#{b.id?.toString().slice(-6)}</span>
                      <span className={`dd-strip-status dd-st--${b.status}`}>{b.status}</span>
                    </div>
                    <div className="dd-strip-client">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{b.client?.full_name || 'Client'}</span>
                    </div>
                    <div className="dd-strip-route">
                      <FontAwesomeIcon icon={faLocationDot} />
                      <span>{b.pickup_location || b.gig?.start_location}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="dd-strip-arrow" />
                      <span>{b.dropoff_location || b.gig?.end_location}</span>
                    </div>
                    <div className="dd-strip-bottom">
                      <span className="dd-strip-price">{b.currency} {parseFloat(b.total_price).toLocaleString()}</span>
                      <span className="dd-strip-date">{b.start_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ Content + Map Split ══ */}
          <div className="dd-content-split">
            {/* Left Panel */}
            <div className="dd-panel-left">

              {/* ── Overview Tab ── */}
              {tab === 'overview' && (
                <div className="dd-overview-content">
                  {loadingStats ? (
                    <div className="dd-loading"><div className="dd-spinner" /></div>
                  ) : stats ? (
                    <>
                      <div className="dd-stat-row">
                        <div className="dd-stat-card dd-sc--blue">
                          <div className="dd-sc-icon"><FontAwesomeIcon icon={faCarSide} /></div>
                          <div className="dd-sc-info">
                            <span className="dd-sc-val">{stats.activeGigs}</span>
                            <span className="dd-sc-lbl">Active Gigs</span>
                          </div>
                        </div>
                        <div className="dd-stat-card dd-sc--green">
                          <div className="dd-sc-icon"><FontAwesomeIcon icon={faClipboardList} /></div>
                          <div className="dd-sc-info">
                            <span className="dd-sc-val">{stats.totalBookings}</span>
                            <span className="dd-sc-lbl">Total Bookings</span>
                          </div>
                        </div>
                        <div className="dd-stat-card dd-sc--amber">
                          <div className="dd-sc-icon"><FontAwesomeIcon icon={faClock} /></div>
                          <div className="dd-sc-info">
                            <span className="dd-sc-val">{stats.pendingBookings}</span>
                            <span className="dd-sc-lbl">Pending</span>
                          </div>
                        </div>
                        <div className="dd-stat-card dd-sc--teal">
                          <div className="dd-sc-icon"><FontAwesomeIcon icon={faCircleCheck} /></div>
                          <div className="dd-sc-info">
                            <span className="dd-sc-val">{stats.completedBookings}</span>
                            <span className="dd-sc-lbl">Completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="dd-stat-card dd-stat-revenue">
                        <div className="dd-sc-icon"><FontAwesomeIcon icon={faMoneyBill} /></div>
                        <div className="dd-sc-info">
                          <span className="dd-sc-val">LKR {stats.totalRevenue?.toLocaleString()}</span>
                          <span className="dd-sc-lbl">Total Revenue</span>
                        </div>
                      </div>

                      {/* Selected booking detail */}
                      {selectedBooking && (
                        <div className="dd-detail-card">
                          <div className="dd-detail-header">
                            <h3>{selectedBooking.gig?.title || `Booking #${selectedBooking.id}`}</h3>
                            <span className={`dd-badge dd-badge--${selectedBooking.status}`}>{selectedBooking.status}</span>
                          </div>
                          <div className="dd-detail-grid">
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faUsers} /> Client</span>
                              <span className="dd-dg-value">{selectedBooking.client?.full_name || 'Unknown'}</span>
                            </div>
                            {selectedBooking.client?.email && (
                              <div className="dd-dg-item">
                                <span className="dd-dg-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
                                <span className="dd-dg-value">{selectedBooking.client.email}</span>
                              </div>
                            )}
                            {selectedBooking.client?.phone && (
                              <div className="dd-dg-item">
                                <span className="dd-dg-label"><FontAwesomeIcon icon={faPhone} /> Phone</span>
                                <span className="dd-dg-value">{selectedBooking.client.phone}</span>
                              </div>
                            )}
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faCalendarDays} /> Duration</span>
                              <span className="dd-dg-value">{selectedBooking.start_date} → {selectedBooking.end_date}</span>
                            </div>
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faUsers} /> Passengers</span>
                              <span className="dd-dg-value">{selectedBooking.passenger_count}</span>
                            </div>
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faMoneyBill} /> Price</span>
                              <span className="dd-dg-value dd-dg-price">{selectedBooking.currency} {parseFloat(selectedBooking.total_price).toLocaleString()}</span>
                            </div>
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faMapPin} /> Pickup</span>
                              <span className="dd-dg-value">{selectedBooking.pickup_location}</span>
                            </div>
                            <div className="dd-dg-item">
                              <span className="dd-dg-label"><FontAwesomeIcon icon={faMapPin} /> Dropoff</span>
                              <span className="dd-dg-value">{selectedBooking.dropoff_location}</span>
                            </div>
                          </div>
                          {selectedBooking.notes && <div className="dd-detail-notes">{selectedBooking.notes}</div>}
                          {selectedBooking.status === 'pending' && (
                            <div className="dd-detail-actions">
                              <button className="dd-act-btn dd-act--confirm" onClick={() => handleBookingAction(selectedBooking.id, 'confirmed')}>
                                <FontAwesomeIcon icon={faCheck} /> Confirm
                              </button>
                              <button className="dd-act-btn dd-act--cancel" onClick={() => handleBookingAction(selectedBooking.id, 'cancelled')}>
                                <FontAwesomeIcon icon={faTimes} /> Decline
                              </button>
                            </div>
                          )}
                          {selectedBooking.status === 'confirmed' && (
                            <div className="dd-detail-actions">
                              <button className="dd-act-btn dd-act--complete" onClick={() => handleBookingAction(selectedBooking.id, 'completed')}>
                                <FontAwesomeIcon icon={faCircleCheck} /> Complete Trip
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Chart */}
                      {chartData.length > 0 && !selectedBooking && (
                        <div className="dd-chart-card">
                          <h3>Monthly Revenue</h3>
                          <div className="dd-chart">
                            {chartData.map((d) => (
                              <div key={d.month} className="dd-chart-bar-wrap">
                                <div className="dd-chart-bar" style={{ height: `${d.pct}%` }}>
                                  <span className="dd-chart-val">LKR {d.value.toLocaleString()}</span>
                                </div>
                                <span className="dd-chart-label">{d.month}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* ── Gigs Tab ── */}
              {tab === 'gigs' && (
                <div className="dd-gigs-content">
                  {showGigForm ? (
                    <form className="dd-gig-form" onSubmit={submitGig}>
                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faRoute} /> Route Details</h3>
                        <div className="dd-form-row">
                          <div className="dd-fg">
                            <label>From *</label>
                            <input required placeholder="e.g. Colombo, Airport" value={gigForm.start_location}
                              onChange={(e) => { setGigForm(p => ({ ...p, start_location: e.target.value })); setGigErrors(p => ({ ...p, start_location: '' })); }} />
                            {gigErrors.start_location && <span className="dd-field-error">{gigErrors.start_location}</span>}
                          </div>
                          <div className="dd-fg">
                            <label>To *</label>
                            <input required placeholder="e.g. Galle, Kandy" value={gigForm.end_location}
                              onChange={(e) => { setGigForm(p => ({ ...p, end_location: e.target.value })); setGigErrors(p => ({ ...p, end_location: '' })); }} />
                            {gigErrors.end_location && <span className="dd-field-error">{gigErrors.end_location}</span>}
                          </div>
                        </div>
                        {mapInfo && (
                          <div className="dd-route-preview">
                            <span><FontAwesomeIcon icon={faRoute} /> {mapInfo.distance} km</span>
                            <span><FontAwesomeIcon icon={faClock} /> ~{mapInfo.duration} min</span>
                          </div>
                        )}
                      </div>

                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faCarSide} /> Gig Info</h3>
                        <div className="dd-fg">
                          <label>Title *</label>
                          <input required placeholder="E.g. Colombo Airport Transfer" value={gigForm.title}
                            onChange={(e) => { setGigForm(p => ({ ...p, title: e.target.value })); setGigErrors(p => ({ ...p, title: '' })); }} />
                          {gigErrors.title && <span className="dd-field-error">{gigErrors.title}</span>}
                        </div>
                        <div className="dd-fg">
                          <label>Description</label>
                          <textarea rows={2} placeholder="What to expect..." value={gigForm.description}
                            onChange={(e) => { setGigForm(p => ({ ...p, description: e.target.value })); setGigErrors(p => ({ ...p, description: '' })); }} />
                          {gigErrors.description && <span className="dd-field-error">{gigErrors.description}</span>}
                        </div>
                      </div>

                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faVanShuttle} /> Vehicle</h3>
                        <div className="dd-form-row">
                          <div className="dd-fg">
                            <label>Category *</label>
                            <select required value={gigForm.vehicle_category}
                              onChange={(e) => { setGigForm(p => ({ ...p, vehicle_category: e.target.value })); setGigErrors(p => ({ ...p, vehicle_category: '' })); }}>
                              <option value="">Select</option>
                              {VEHICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {gigErrors.vehicle_category && <span className="dd-field-error">{gigErrors.vehicle_category}</span>}
                          </div>
                          <div className="dd-fg">
                            <label>Type *</label>
                            <select required value={gigForm.vehicle_type}
                              onChange={(e) => { setGigForm(p => ({ ...p, vehicle_type: e.target.value })); setGigErrors(p => ({ ...p, vehicle_type: '' })); }}>
                              <option value="">Select</option>
                              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {gigErrors.vehicle_type && <span className="dd-field-error">{gigErrors.vehicle_type}</span>}
                          </div>
                        </div>
                        <div className="dd-form-row">
                          <div className="dd-fg">
                            <label>Make</label>
                            <input placeholder="e.g. Toyota" value={gigForm.vehicle_make}
                              onChange={(e) => { setGigForm(p => ({ ...p, vehicle_make: e.target.value })); setGigErrors(p => ({ ...p, vehicle_make: '' })); }} />
                            {gigErrors.vehicle_make && <span className="dd-field-error">{gigErrors.vehicle_make}</span>}
                          </div>
                          <div className="dd-fg">
                            <label>Model</label>
                            <input placeholder="e.g. HiAce" value={gigForm.vehicle_model}
                              onChange={(e) => { setGigForm(p => ({ ...p, vehicle_model: e.target.value })); setGigErrors(p => ({ ...p, vehicle_model: '' })); }} />
                            {gigErrors.vehicle_model && <span className="dd-field-error">{gigErrors.vehicle_model}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faMoneyBill} /> Pricing</h3>
                        <div className="dd-form-row">
                          <div className="dd-fg">
                            <label>Passengers *</label>
                            <input type="number" required min="1" max="50" value={gigForm.passenger_capacity}
                              onChange={(e) => { setGigForm(p => ({ ...p, passenger_capacity: e.target.value })); setGigErrors(p => ({ ...p, passenger_capacity: '' })); }} />
                            {gigErrors.passenger_capacity && <span className="dd-field-error">{gigErrors.passenger_capacity}</span>}
                          </div>
                          <div className="dd-fg">
                            <label>Price/Day (LKR) *</label>
                            <input type="number" required min="0" step="100" placeholder="5000" value={gigForm.price_per_day}
                              onChange={(e) => { setGigForm(p => ({ ...p, price_per_day: e.target.value })); setGigErrors(p => ({ ...p, price_per_day: '' })); }} />
                            {gigErrors.price_per_day && <span className="dd-field-error">{gigErrors.price_per_day}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faCalendarDays} /> Availability</h3>
                        <div className="dd-form-row">
                          <div className="dd-fg">
                            <label>From</label>
                            <input type="date" value={gigForm.available_from}
                              min={new Date().toISOString().slice(0, 10)}
                              onChange={(e) => { setGigForm(p => ({ ...p, available_from: e.target.value, available_to: p.available_to && p.available_to < e.target.value ? '' : p.available_to })); setGigErrors(p => ({ ...p, available_to: '' })); }} />
                          </div>
                          <div className="dd-fg">
                            <label>To</label>
                            <input type="date" value={gigForm.available_to}
                              min={gigForm.available_from || new Date().toISOString().slice(0, 10)}
                              onChange={(e) => { setGigForm(p => ({ ...p, available_to: e.target.value })); setGigErrors(p => ({ ...p, available_to: '' })); }} />
                            {gigErrors.available_to && <span className="dd-field-error">{gigErrors.available_to}</span>}
                          </div>
                          <div className="dd-fg">
                            <label>Status</label>
                            <select value={gigForm.status} onChange={(e) => setGigForm(p => ({ ...p, status: e.target.value }))}>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="dd-form-section">
                        <h3><FontAwesomeIcon icon={faUpload} /> Photos ({gigImages.length}/5)</h3>
                        <div className="dd-upload-zone"
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-active'); }}
                          onDragLeave={(e) => e.currentTarget.classList.remove('drag-active')}
                          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-active'); handleGigImages(e.dataTransfer.files); }}>
                          <FontAwesomeIcon icon={faUpload} className="dd-upload-icon" />
                          <p>Drag & drop or <button type="button" className="dd-upload-trigger" onClick={() => gigImageInputRef.current?.click()}>browse</button></p>
                          <input ref={gigImageInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                            onChange={(e) => handleGigImages(e.target.files)} />
                        </div>
                        {gigImagePreviews.length > 0 && (
                          <div className="dd-img-grid">
                            {gigImagePreviews.map((url, idx) => (
                              <div key={idx} className="dd-img-thumb">
                                <img src={url} alt={`Gig ${idx + 1}`} />
                                <button type="button" className="dd-img-remove" onClick={() => removeGigImage(idx)}>
                                  <FontAwesomeIcon icon={faX} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="dd-form-btns">
                        <button type="button" className="dd-btn-secondary" onClick={resetGigForm}>Cancel</button>
                        <button type="submit" className="dd-btn-primary" disabled={gigSubmitting}>
                          {gigSubmitting ? 'Saving...' : editingGig ? 'Update Gig' : 'Create Gig'}
                        </button>
                      </div>
                    </form>
                  ) : loadingGigs ? (
                    <div className="dd-loading"><div className="dd-spinner" /></div>
                  ) : gigs.length === 0 ? (
                    <div className="dd-empty">
                      <FontAwesomeIcon icon={faCarSide} className="dd-empty-icon" />
                      <h3>No gigs yet</h3>
                      <p>Create your first transport gig</p>
                      <button className="dd-btn-primary" onClick={() => { resetGigForm(); setShowGigForm(true); }}>
                        <FontAwesomeIcon icon={faPlus} /> Create Gig
                      </button>
                    </div>
                  ) : (
                    <div className="dd-gig-list">
                      {gigs.map((g) => (
                        <div key={g.id} className={`dd-gig-card ${selectedGig?.id === g.id ? 'selected' : ''}`}
                          onClick={() => selectGig(g)}>
                          <div className="dd-gc-top">
                            <h4>{g.title}</h4>
                            <span className={`dd-badge dd-badge--${g.status}`}>{g.status}</span>
                          </div>
                          <div className="dd-gc-route">
                            <FontAwesomeIcon icon={faLocationDot} /> {g.start_location}
                            <FontAwesomeIcon icon={faArrowRight} className="dd-gc-arrow" /> {g.end_location}
                          </div>
                          <div className="dd-gc-meta">
                            <span className="dd-gc-tag">{g.vehicle_type}</span>
                            <span className="dd-gc-tag"><FontAwesomeIcon icon={faUsers} /> {g.passenger_capacity}</span>
                          </div>
                          <div className="dd-gc-footer">
                            <span className="dd-gc-price">{g.currency} {parseFloat(g.price_per_day).toLocaleString()}<small>/day</small></span>
                            <div className="dd-gc-actions">
                              <button className="dd-gc-btn" title="View Route" onClick={(e) => { e.stopPropagation(); selectGig(g); }}>
                                <FontAwesomeIcon icon={faMap} />
                              </button>
                              <button className="dd-gc-btn" title="Edit" onClick={(e) => { e.stopPropagation(); openEditGig(g); }}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </button>
                              <button className="dd-gc-btn dd-gc-btn--danger" title="Delete" onClick={(e) => { e.stopPropagation(); deleteGig(g.id); }}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Bookings Tab ── */}
              {tab === 'bookings' && (
                <div className="dd-bookings-content">
                  {loadingBookings ? (
                    <div className="dd-loading"><div className="dd-spinner" /></div>
                  ) : bookings.length === 0 ? (
                    <div className="dd-empty">
                      <FontAwesomeIcon icon={faClipboardList} className="dd-empty-icon" />
                      <h3>No bookings yet</h3>
                      <p>Client bookings will appear here</p>
                    </div>
                  ) : (
                    <div className="dd-booking-list">
                      {bookings.map((b) => (
                        <div key={b.id}
                          className={`dd-bk-card ${selectedBooking?.id === b.id ? 'selected' : ''} dd-bk--${b.status}`}
                          onClick={() => selectBooking(b)}>
                          <div className="dd-bk-top">
                            <div>
                              <h4>{b.gig?.title || `Gig #${b.gig_id}`}</h4>
                              <p className="dd-bk-client"><FontAwesomeIcon icon={faUsers} /> {b.client?.full_name || 'Unknown'}</p>
                            </div>
                            <div className="dd-bk-right-info">
                              <span className="dd-bk-price">{b.currency} {parseFloat(b.total_price).toLocaleString()}</span>
                              <span className={`dd-badge dd-badge--${b.status}`}>{b.status}</span>
                            </div>
                          </div>
                          <div className="dd-bk-details">
                            <span><FontAwesomeIcon icon={faCalendarDays} /> {b.start_date} → {b.end_date}</span>
                            <span><FontAwesomeIcon icon={faLocationDot} /> {b.pickup_location} → {b.dropoff_location}</span>
                            <span><FontAwesomeIcon icon={faUsers} /> {b.passenger_count} pax</span>
                          </div>
                          {selectedBooking?.id === b.id && (
                            <div className="dd-bk-expanded">
                              {b.notes && <p className="dd-bk-notes">{b.notes}</p>}
                              <div className="dd-bk-actions">
                                {b.status === 'pending' && (
                                  <>
                                    <button className="dd-act-btn dd-act--confirm" onClick={(e) => { e.stopPropagation(); handleBookingAction(b.id, 'confirmed'); }}>
                                      <FontAwesomeIcon icon={faCheck} /> Confirm
                                    </button>
                                    <button className="dd-act-btn dd-act--cancel" onClick={(e) => { e.stopPropagation(); handleBookingAction(b.id, 'cancelled'); }}>
                                      <FontAwesomeIcon icon={faTimes} /> Decline
                                    </button>
                                  </>
                                )}
                                {b.status === 'confirmed' && (
                                  <button className="dd-act-btn dd-act--complete" onClick={(e) => { e.stopPropagation(); handleBookingAction(b.id, 'completed'); }}>
                                    <FontAwesomeIcon icon={faCircleCheck} /> Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Calendar Tab ── */}
              {tab === 'calendar' && (
                <div className="dd-calendar-content">
                  <div className="dd-cal-header">
                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h3>{monthNames[calMonth]} {calYear}</h3>
                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                  <div className="dd-cal-grid">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} className="dd-cal-day-label">{d}</div>
                    ))}
                    {calDays.map((day, i) => {
                      if (day === null) return <div key={`e-${i}`} className="dd-cal-cell dd-cal-empty" />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayBookings = bookedDates[dateStr] || [];
                      const isToday = dateStr === new Date().toISOString().slice(0, 10);
                      return (
                        <div key={day}
                          className={`dd-cal-cell ${isToday ? 'dd-cal-today' : ''} ${dayBookings.length > 0 ? 'dd-cal-booked dd-cal-clickable' : ''}`}
                          onClick={() => handleDateClick(day, dayBookings)}>
                          <span className="dd-cal-date">{day}</span>
                          {dayBookings.length > 0 && (
                            <div className="dd-cal-dots">
                              {dayBookings.slice(0, 3).map((b, j) => (
                                <span key={j} className={`dd-cal-dot dd-dot--${b.status}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="dd-cal-legend">
                    <span><span className="dd-cal-dot dd-dot--pending" /> Pending</span>
                    <span><span className="dd-cal-dot dd-dot--confirmed" /> Confirmed</span>
                    <span><span className="dd-cal-dot dd-dot--completed" /> Completed</span>
                  </div>

                  {selectedDate && selectedBookings.length > 0 && (
                    <div className="dd-date-detail">
                      <div className="dd-date-detail-header">
                        <h4>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                        <button onClick={() => setSelectedDate(null)}><FontAwesomeIcon icon={faX} /></button>
                      </div>
                      {selectedBookings.map((b) => (
                        <div key={b.id} className={`dd-date-booking dd-bk--${b.status}`} onClick={() => selectBooking(b)}>
                          <div className="dd-date-bk-top">
                            <strong>{b.gig?.title || `Booking #${b.id}`}</strong>
                            <span className={`dd-badge dd-badge--${b.status}`}>{b.status}</span>
                          </div>
                          <p><FontAwesomeIcon icon={faUsers} /> {b.client?.full_name || 'Client'}</p>
                          <p><FontAwesomeIcon icon={faLocationDot} /> {b.pickup_location} → {b.dropoff_location}</p>
                          <p className="dd-date-bk-price">{b.currency} {parseFloat(b.total_price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ══ Right Panel: Map ══ */}
            <div className="dd-panel-right">
              <div className="dd-map-wrapper">
                <MapContainer center={SRI_LANKA_CENTER} zoom={8} className="dd-map" scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapStart && (
                    <Marker position={mapStart} icon={startIcon}>
                      <Popup>{mapInfo?.from || 'Start'}</Popup>
                    </Marker>
                  )}
                  {mapEnd && (
                    <Marker position={mapEnd} icon={endIcon}>
                      <Popup>{mapInfo?.to || 'End'}</Popup>
                    </Marker>
                  )}
                  {mapRoute && <Polyline positions={mapRoute} color="#0e4d6a" weight={4} opacity={0.8} />}
                  {mapBounds && <MapFitter bounds={mapBounds} />}
                </MapContainer>

                {mapInfo && (
                  <div className="dd-map-info-overlay">
                    <div className="dd-map-info-item">
                      <FontAwesomeIcon icon={faRoute} />
                      <div>
                        <span className="dd-mi-label">Distance</span>
                        <span className="dd-mi-value">{mapInfo.distance} km</span>
                      </div>
                    </div>
                    <div className="dd-map-info-item">
                      <FontAwesomeIcon icon={faClock} />
                      <div>
                        <span className="dd-mi-label">Duration</span>
                        <span className="dd-mi-value">~{mapInfo.duration} min</span>
                      </div>
                    </div>
                    <div className="dd-map-info-item">
                      <FontAwesomeIcon icon={faLocationDot} />
                      <div>
                        <span className="dd-mi-label">Route</span>
                        <span className="dd-mi-value">{mapInfo.from} → {mapInfo.to}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!mapRoute && !mapStart && (
                  <div className="dd-map-placeholder">
                    <FontAwesomeIcon icon={faMap} />
                    <p>Select a booking or gig to see the route</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DriverDashboard;

import { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import * as api from '../services/api';
import './AdminDashboard.css';
import './TouristDashboard.css';

export default function AdminDashboard({ user, onLogout }) {
    const [tab, setTab] = useState("overview");
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tab !== "overview") {
            loadData();
        }
    }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === "destinations") setData(await api.getDestinations());
            else if (tab === "hotels") setData(await api.getHotels());
            else if (tab === "users") setData(await api.getUsers());
        } catch (error) {
            console.error('Error loading data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const done = () => {
        setShowForm(false);
        loadData();
    };

    return (
        <div className="admin-dashboard">
            <Navbar />

            {/* Dashboard Header */}
            <section className="dashboard-header">
                <div className="container">
                    <div className="dashboard-welcome">
                        <h1>Admin Panel</h1>
                        <p>Manage destinations, hotels, and users</p>
                    </div>
                    <button className="btn-logout" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="dashboard-tabs">
                <div className="container">
                    <button 
                        className={`tab-button ${tab === 'overview' ? 'active' : ''}`}
                        onClick={() => { setTab('overview'); setShowForm(false); }}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-button ${tab === 'destinations' ? 'active' : ''}`}
                        onClick={() => { setTab('destinations'); setShowForm(false); }}
                    >
                        Destinations
                    </button>
                    <button 
                        className={`tab-button ${tab === 'hotels' ? 'active' : ''}`}
                        onClick={() => { setTab('hotels'); setShowForm(false); }}
                    >
                        Hotels
                    </button>
                    <button 
                        className={`tab-button ${tab === 'users' ? 'active' : ''}`}
                        onClick={() => { setTab('users'); setShowForm(false); }}
                    >
                        Users
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <section className="dashboard-content">
                <div className="container">
                    {tab === "overview" && <AdminOverview setTab={setTab} />}

                    {tab === "destinations" && (
                        <div>
                            {showForm ? (
                                <CreateDestination onDone={done} />
                            ) : (
                                <>
                                    <button className="btn-create" onClick={() => setShowForm(true)}>
                                        + Create Destination
                                    </button>
                                    {loading ? (
                                        <div className="loading-container">
                                            <div className="spinner"></div>
                                            <p>Loading destinations...</p>
                                        </div>
                                    ) : (
                                        <div className="items-grid">
                                            {data.map(item => (
                                                <DestinationCard key={item.id} item={item} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {tab === "hotels" && (
                        <div>
                            {showForm ? (
                                <CreateHotel onDone={done} />
                            ) : (
                                <>
                                    <button className="btn-create" onClick={() => setShowForm(true)}>
                                        + Create Hotel
                                    </button>
                                    {loading ? (
                                        <div className="loading-container">
                                            <div className="spinner"></div>
                                            <p>Loading hotels...</p>
                                        </div>
                                    ) : (
                                        <div className="items-grid">
                                            {data.map(item => (
                                                <HotelCard key={item.id} item={item} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {tab === "users" && (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.username}</td>
                                            <td>{u.firstName} {u.lastName}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge ${u.role?.toLowerCase()}`}>
                                                    {u.role || 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

// Admin Overview Component
function AdminOverview({ setTab }) {
    const [stats, setStats] = useState({ destinations: 0, hotels: 0, users: 0 });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [dests, hotels, users] = await Promise.all([
                api.getDestinations().catch(() => []),
                api.getHotels().catch(() => []),
                api.getUsers().catch(() => [])
            ]);
            
            setStats({
                destinations: dests?.length || 0,
                hotels: hotels?.length || 0,
                users: users?.length || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <div>
            <div className="overview-cards">
                <div className="overview-card" onClick={() => setTab("destinations")}>
                    <div className="card-icon" style={{ backgroundColor: "#e0f2f1", color: "#00897b" }}>
                        📍
                    </div>
                    <div className="card-value">{stats.destinations}</div>
                    <div className="card-label">Destinations</div>
                    <div className="card-sub">Listed</div>
                </div>

                <div className="overview-card" onClick={() => setTab("hotels")}>
                    <div className="card-icon" style={{ backgroundColor: "#fff3e0", color: "#ff9800" }}>
                        🏨
                    </div>
                    <div className="card-value">{stats.hotels}</div>
                    <div className="card-label">Hotels</div>
                    <div className="card-sub">Listed</div>
                </div>

                <div className="overview-card" onClick={() => setTab("users")}>
                    <div className="card-icon" style={{ backgroundColor: "#e8eaf6", color: "#3f51b5" }}>
                        👥
                    </div>
                    <div className="card-value">{stats.users}</div>
                    <div className="card-label">Users</div>
                    <div className="card-sub">Registered</div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-grid">
                    <div className="action-card" onClick={() => setTab("destinations")}>
                        <div className="action-icon" style={{ backgroundColor: "#e0f2f1", color: "#00897b" }}>
                            📍
                        </div>
                        <div>
                            <h4>Manage Destinations</h4>
                            <p>Add or edit destinations</p>
                        </div>
                    </div>

                    <div className="action-card" onClick={() => setTab("hotels")}>
                        <div className="action-icon" style={{ backgroundColor: "#fff3e0", color: "#ff9800" }}>
                            🏨
                        </div>
                        <div>
                            <h4>Manage Hotels</h4>
                            <p>Add or edit hotel listings</p>
                        </div>
                    </div>

                    <div className="action-card" onClick={() => setTab("users")}>
                        <div className="action-icon" style={{ backgroundColor: "#e8eaf6", color: "#3f51b5" }}>
                            👥
                        </div>
                        <div>
                            <h4>View Users</h4>
                            <p>Manage registered users</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Create Destination Component
function CreateDestination({ onDone }) {
    const [form, setForm] = useState({ name: "", description: "", district: "", category: "" });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("district", form.district);
        fd.append("category", form.category);
        if (file) fd.append("image", file);
        
        try {
            await api.createDestination(fd);
            alert("Destination created successfully!");
            onDone();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="form-card">
            <h2>Create Destination</h2>
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} 
                        placeholder="Sigiriya Rock Fortress"
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} 
                        placeholder="Describe the destination..."
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>District</label>
                        <input 
                            type="text"
                            value={form.district}
                            onChange={e => setForm({ ...form, district: e.target.value })} 
                            placeholder="Matale"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <input 
                            type="text"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })} 
                            placeholder="Ancient"
                        />
                    </div>
                </div>

                <div className="image-upload" onClick={() => document.getElementById('dest-image').click()}>
                    <input 
                        id="dest-image"
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <span className="upload-label">
                        {preview ? '✓ Image selected' : '📷 Click to upload image'}
                    </span>
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Create Destination</button>
                    <button type="button" className="btn-cancel" onClick={onDone}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

// Create Hotel Component
function CreateHotel({ onDone }) {
    const [form, setForm] = useState({ 
        hotelName: "", 
        hotelDescription: "", 
        city: "", 
        pricePerNight: "", 
        availableRooms: "" 
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("hotelName", form.hotelName);
        fd.append("hotelDescription", form.hotelDescription);
        fd.append("city", form.city);
        fd.append("pricePerNight", form.pricePerNight);
        fd.append("availableRooms", form.availableRooms);
        if (file) fd.append("image", file);
        
        try {
            await api.createHotel(fd);
            alert("Hotel created successfully!");
            onDone();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="form-card">
            <h2>Create Hotel</h2>
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label>Hotel Name</label>
                    <input 
                        type="text"
                        value={form.hotelName}
                        onChange={e => setForm({ ...form, hotelName: e.target.value })} 
                        placeholder="Grand Hotel Colombo"
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        value={form.hotelDescription}
                        onChange={e => setForm({ ...form, hotelDescription: e.target.value })} 
                        placeholder="Describe the hotel..."
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>City</label>
                        <input 
                            type="text"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })} 
                            placeholder="Colombo"
                        />
                    </div>

                    <div className="form-group">
                        <label>Price per Night (Rs.)</label>
                        <input 
                            type="number"
                            value={form.pricePerNight}
                            onChange={e => setForm({ ...form, pricePerNight: e.target.value })} 
                            placeholder="15000"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Available Rooms</label>
                    <input 
                        type="number"
                        value={form.availableRooms}
                        onChange={e => setForm({ ...form, availableRooms: e.target.value })} 
                        placeholder="50"
                    />
                </div>

                <div className="image-upload" onClick={() => document.getElementById('hotel-image').click()}>
                    <input 
                        id="hotel-image"
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <span className="upload-label">
                        {preview ? '✓ Image selected' : '📷 Click to upload image'}
                    </span>
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Create Hotel</button>
                    <button type="button" className="btn-cancel" onClick={onDone}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

// Destination Card Component
function DestinationCard({ item }) {
    return (
        <div className="item-card">
            {item.image_url && (
                <div className="item-image">
                    <img src={item.image_url} alt={item.name} />
                    {item.category && <div className="item-badge">{item.category}</div>}
                </div>
            )}
            <div className="item-content">
                <h3>{item.name}</h3>
                <p className="item-location">📍 {item.district || item.location || 'Sri Lanka'}</p>
                <p className="item-description">{item.description}</p>
            </div>
        </div>
    );
}

// Hotel Card Component
function HotelCard({ item }) {
    return (
        <div className="item-card">
            {item.images?.[0] && (
                <div className="item-image">
                    <img src={item.images[0]} alt={item.name || item.hotelName} />
                    {item.rating && <div className="item-badge">⭐ {item.rating}</div>}
                </div>
            )}
            <div className="item-content">
                <h3>{item.name || item.hotelName}</h3>
                <p className="item-location">📍 {item.location || item.city}</p>
                <p className="item-description">
                    {item.description || item.hotelDescription}
                </p>
                <div className="item-price">
                    <span className="price-amount">
                        Rs. {parseFloat(item.price_per_night || item.pricePerNight || 0).toLocaleString()}
                    </span>
                    <span className="price-per">/ night</span>
                </div>
            </div>
        </div>
    );
}

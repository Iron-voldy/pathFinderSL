import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import ChatBot from '../components/shared/ChatBot';
import * as api from '../services/api';
import './TouristDashboard.css';

export default function TouristDashboard({ user, onLogout }) {
    const [tab, setTab] = useState("overview");
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    // Budget state
    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [newBudget, setNewBudget] = useState({
        totalBudget: '',
        accommodation: '',
        food: '',
        transport: '',
        activities: ''
    });
    const [newExpense, setNewExpense] = useState({
        category: 'food',
        amount: '',
        description: ''
    });

    useEffect(() => {
        if (["destinations", "hotels", "transport"].includes(tab)) {
            loadData();
        } else if (tab === "budget") {
            loadBudgetData();
        }
    }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const loaders = {
                destinations: api.getDestinations,
                hotels: api.getHotels,
                transport: api.getTransports
            };
            const result = await loaders[tab]();
            setData(result || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadBudgetData = async () => {
        try {
            const budgetData = await api.getBudget();
            if (budgetData) {
                setBudget(budgetData);
                if (budgetData.expenses) {
                    setExpenses(budgetData.expenses);
                }
            }
        } catch (error) {
            console.error('Error loading budget:', error);
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            const result = await api.createBudget(newBudget);
            setBudget(result);
            setExpenses([]);
            alert('Budget created successfully!');
        } catch (error) {
            alert('Error creating budget: ' + error.message);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await api.addExpense(newExpense);
            setNewExpense({ category: 'food', amount: '', description: '' });
            loadBudgetData();
            alert('Expense added successfully!');
        } catch (error) {
            alert('Error adding expense: ' + error.message);
        }
    };

    const calculateSpent = (category) => {
        return expenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    };

    const calculateTotal = () => {
        return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    };

    const calculatePercentage = (spent, allocated) => {
        return allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    };

    return (
        <div className="tourist-dashboard">
            <Navbar />

            {/* Dashboard Header */}
            <section className="dashboard-header">
                <div className="container">
                    <div className="dashboard-welcome">
                        <h1>Welcome back, {user.name || user.firstName}!</h1>
                        <p>Plan your perfect Sri Lankan adventure</p>
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
                        onClick={() => { setTab('overview'); setSelected(null); }}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-button ${tab === 'destinations' ? 'active' : ''}`}
                        onClick={() => { setTab('destinations'); setSelected(null); }}
                    >
                        Destinations
                    </button>
                    <button 
                        className={`tab-button ${tab === 'hotels' ? 'active' : ''}`}
                        onClick={() => { setTab('hotels'); setSelected(null); }}
                    >
                        Hotels
                    </button>
                    <button 
                        className={`tab-button ${tab === 'transport' ? 'active' : ''}`}
                        onClick={() => { setTab('transport'); setSelected(null); }}
                    >
                        Transport
                    </button>
                    <button 
                        className={`tab-button ${tab === 'budget' ? 'active' : ''}`}
                        onClick={() => { setTab('budget'); setSelected(null); }}
                    >
                        Budget Planner
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <section className="dashboard-content">
                <div className="container">
                    {tab === "overview" && <OverviewSection user={user} setTab={setTab} />}

                    {["destinations", "hotels", "transport"].includes(tab) && (
                        loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading {tab}...</p>
                            </div>
                        ) : (
                            <div className="items-grid">
                                {data.map(item => (
                                    <ItemCard key={item.id} item={item} type={tab} />
                                ))}
                                {data.length === 0 && (
                                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-light)', padding: '3rem' }}>
                                        No {tab} found.
                                    </p>
                                )}
                            </div>
                        )
                    )}

                    {tab === "budget" && (
                        <div className="budget-planner">
                            {!budget ? (
                                <div className="budget-card">
                                    <h2>Create Your Budget Plan</h2>
                                    <form onSubmit={handleCreateBudget} className="budget-form">
                                        <div className="form-group">
                                            <label>Total Budget (Rs.)</label>
                                            <input
                                                type="number"
                                                value={newBudget.totalBudget}
                                                onChange={(e) => setNewBudget({ ...newBudget, totalBudget: e.target.value })}
                                                placeholder="100000"
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Accommodation</label>
                                                <input
                                                    type="number"
                                                    value={newBudget.accommodation}
                                                    onChange={(e) => setNewBudget({ ...newBudget, accommodation: e.target.value })}
                                                    placeholder="40000"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Food</label>
                                                <input
                                                    type="number"
                                                    value={newBudget.food}
                                                    onChange={(e) => setNewBudget({ ...newBudget, food: e.target.value })}
                                                    placeholder="30000"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Transport</label>
                                                <input
                                                    type="number"
                                                    value={newBudget.transport}
                                                    onChange={(e) => setNewBudget({ ...newBudget, transport: e.target.value })}
                                                    placeholder="20000"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Activities</label>
                                                <input
                                                    type="number"
                                                    value={newBudget.activities}
                                                    onChange={(e) => setNewBudget({ ...newBudget, activities: e.target.value })}
                                                    placeholder="10000"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn-primary">Create Budget</button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div className="budget-card">
                                        <h2>Budget Tracker</h2>
                                        <div className="budget-categories">
                                            {['accommodation', 'food', 'transport', 'activities'].map(category => {
                                                const allocated = parseFloat(budget[category] || 0);
                                                const spent = calculateSpent(category);
                                                const percentage = calculatePercentage(spent, allocated);

                                                return (
                                                    <div key={category} className="budget-category">
                                                        <div className="category-header">
                                                            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                                                            <span className={`category-percentage ${percentage > 90 ? 'warning' : ''}`}>
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div 
                                                                className={`progress-fill ${percentage > 90 ? 'warning' : ''}`}
                                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="category-amounts">
                                                            <span>Spent: Rs. {spent.toLocaleString()}</span>
                                                            <span>Budget: Rs. {allocated.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="budget-card">
                                        <h2>Add Expense</h2>
                                        <form onSubmit={handleAddExpense} className="budget-form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Category</label>
                                                    <select
                                                        value={newExpense.category}
                                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                                    >
                                                        <option value="accommodation">Accommodation</option>
                                                        <option value="food">Food</option>
                                                        <option value="transport">Transport</option>
                                                        <option value="activities">Activities</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Amount (Rs.)</label>
                                                    <input
                                                        type="number"
                                                        value={newExpense.amount}
                                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                        placeholder="5000"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Description</label>
                                                <input
                                                    type="text"
                                                    value={newExpense.description}
                                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                                    placeholder="e.g., Hotel booking"
                                                    required
                                                />
                                            </div>

                                            <button type="submit" className="btn-primary">Add Expense</button>
                                        </form>

                                        {expenses.length > 0 && (
                                            <div className="expenses-list">
                                                <h3>Recent Expenses</h3>
                                                {expenses.slice(-10).reverse().map((expense, index) => (
                                                    <div key={index} className="expense-item">
                                                        <div>
                                                            <p className="expense-desc">{expense.description}</p>
                                                            <span className="expense-category">{expense.category}</span>
                                                        </div>
                                                        <span className="expense-amount">Rs. {parseFloat(expense.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
            <ChatBot />
        </div>
    );
}

// Overview Section Component
function OverviewSection({ user, setTab }) {
    const [stats, setStats] = useState({
        destinations: 0,
        hotels: 0,
        transports: 0,
        budgetTotal: 0,
        budgetSpent: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [destinations, hotels, transports, budget] = await Promise.all([
                api.getDestinations().catch(() => []),
                api.getHotels().catch(() => []),
                api.getTransports().catch(() => []),
                api.getBudget().catch(() => null)
            ]);

            let budgetTotal = 0;
            let budgetSpent = 0;

            if (budget) {
                budgetTotal = parseFloat(budget.totalBudget || budget.total_budget || 0);
                if (budget.expenses && Array.isArray(budget.expenses)) {
                    budgetSpent = budget.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
                }
            }

            setStats({
                destinations: destinations?.length || 0,
                hotels: hotels?.length || 0,
                transports: transports?.length || 0,
                budgetTotal,
                budgetSpent
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <div>
            <div className="overview-cards">
                <div className="overview-card">
                    <div className="card-icon" style={{ backgroundColor: "#e0f2f1", color: "#00897b" }}>
                        📍
                    </div>
                    <div className="card-value">{stats.destinations}</div>
                    <div className="card-label">Destinations</div>
                    <div className="card-sub">Available to explore</div>
                </div>

                <div className="overview-card" onClick={() => setTab('hotels')}>
                    <div className="card-icon" style={{ backgroundColor: "#fff3e0", color: "#ff9800" }}>
                        🏨
                    </div>
                    <div className="card-value">{stats.hotels}</div>
                    <div className="card-label">Hotels</div>
                    <div className="card-sub">Ready to book</div>
                </div>

                <div className="overview-card" onClick={() => setTab('transport')}>
                    <div className="card-icon" style={{ backgroundColor: "#e8eaf6", color: "#3f51b5" }}>
                        🚗
                    </div>
                    <div className="card-value">{stats.transports}</div>
                    <div className="card-label">Transport Options</div>
                    <div className="card-sub">Available vehicles</div>
                </div>

                <div className="overview-card" onClick={() => setTab('budget')}>
                    <div className="card-icon" style={{ backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
                        💰
                    </div>
                    <div className="card-value">Rs. {stats.budgetTotal.toLocaleString()}</div>
                    <div className="card-label">Total Budget</div>
                    <div className="card-sub">Rs. {stats.budgetSpent.toLocaleString()} spent</div>
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
                            <h4>Explore Destinations</h4>
                            <p>Discover amazing places in Sri Lanka</p>
                        </div>
                    </div>

                    <div className="action-card" onClick={() => setTab("hotels")}>
                        <div className="action-icon" style={{ backgroundColor: "#fff3e0", color: "#ff9800" }}>
                            🏨
                        </div>
                        <div>
                            <h4>Find Hotels</h4>
                            <p>Book your perfect accommodation</p>
                        </div>
                    </div>

                    <div className="action-card" onClick={() => setTab("transport")}>
                        <div className="action-icon" style={{ backgroundColor: "#e8eaf6", color: "#3f51b5" }}>
                            🚗
                        </div>
                        <div>
                            <h4>Book Transport</h4>
                            <p>Find reliable transportation</p>
                        </div>
                    </div>

                    <div className="action-card" onClick={() => setTab("budget")}>
                        <div className="action-icon" style={{ backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
                            💰
                        </div>
                        <div>
                            <h4>Manage Budget</h4>
                            <p>Plan and track your expenses</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Item Card Component
function ItemCard({ item, type }) {
    const getImageUrl = () => {
        if (type === 'destinations') return item.image_url || item.imageUrl;
        if (type === 'hotels') return item.images?.[0] || item.image_url;
        return null;
    };

    const getPrice = () => {
        if (type === 'hotels') return `Rs. ${parseFloat(item.price_per_night || item.pricePerNight || 0).toLocaleString()}`;
        if (type === 'transport') return `Rs. ${parseFloat(item.price_per_day || item.pricePerDay || 0).toLocaleString()}`;
        return null;
    };

    const getLocation = () => {
        if (type === 'destinations') return item.location || item.district || 'Sri Lanka';
        if (type === 'hotels') return item.location || item.city;
        if (type === 'transport') return item.provider_name || item.providerName;
        return '';
    };

    return (
        <div className="item-card">
            {getImageUrl() && (
                <div className="item-image">
                    <img src={getImageUrl()} alt={item.name || item.hotelName} />
                    {item.rating && (
                        <div className="item-badge">⭐ {item.rating}</div>
                    )}
                    {item.capacity && type === 'transport' && (
                        <div className="item-badge">{item.capacity} seats</div>
                    )}
                </div>
            )}
            <div className="item-content">
                <h3>{item.name || item.hotelName || item.vehicle_type || item.vehicleType}</h3>
                <p className="item-location">📍 {getLocation()}</p>
                <p className="item-description">
                    {item.description || item.hotelDescription || 'No description available'}
                </p>
                {getPrice() && (
                    <div className="item-price">
                        <span className="price-amount">{getPrice()}</span>
                        <span className="price-per">/ {type === 'hotels' ? 'night' : 'day'}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

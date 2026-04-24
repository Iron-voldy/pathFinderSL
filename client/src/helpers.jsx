import { useState, useEffect } from "react";
import * as api from "./services/api";

export const BACKEND = "http://localhost:5000";

// Helper functions
export function getItemImage(item, type) {
    if (type === "destinations") {
        const urls = item.imageUrls ? item.imageUrls.split(",") : [];
        return urls.length > 0 ? `${BACKEND}${urls[0]}` : null;
    }
    if (type === "hotels") return item.hotelImage ? `${BACKEND}${item.hotelImage}` : (item.image_url ? `${BACKEND}${item.image_url}` : null);
    if (type === "transport") return item.transportImage ? `${BACKEND}${item.transportImage}` : null;
    return null;
}

export function getItemTitle(item) {
    return item.name || item.hotelName || item.hotel_name || item.vehicleType;
}

export function getItemDescription(item, type) {
    return type === "hotels" ? (item.hotelDescription || item.hotel_description || "") : (item.description || "");
}

export function getItemSubtitle(item, type) {
    if (type === "destinations") return item.district || item.location || "";
    if (type === "hotels") return item.city || item.location || "";
    if (type === "transport") return item.pricePerKm ? `Rs.${item.pricePerKm}/km` : "";
    return "";
}

// Sidebar 
export function Sidebar({ brand, items, active, onSelect, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand"><div className="brand-dot">P</div> {brand}</div>
            <div className="sidebar-nav">
                {items.map(i => (
                    <button key={i.key} className={active === i.key ? "active" : ""} onClick={() => onSelect(i.key)}>
                        <span className="nav-icon">{i.icon}</span> {i.label}
                    </button>
                ))}
            </div>
            <div className="sidebar-bottom">
                <button onClick={onLogout}><span className="nav-icon">X</span> Logout</button>
            </div>
        </aside>
    );
}

// Image Upload 
export function ImageUpload({ preview, onChange }) {
    return (
        <div className="image-upload-section">
            <label className="image-upload-label">
                {preview ? <img src={preview} alt="Preview" className="image-preview" /> : (
                    <div className="image-upload-placeholder">
                        <span className="upload-icon">+</span>
                        <span>Click to upload an image</span>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
            </label>
        </div>
    );
}

// Item Card
export function ItemCard({ item, type, onClick }) {
    const img = getItemImage(item, type);
    return (
        <div className={`item-card ${onClick ? "clickable" : ""}`} onClick={onClick}>
            {img
                ? <div className="card-image-wrapper"><img src={img} alt={getItemTitle(item)} className="card-image" /></div>
                : <div className="card-image-placeholder">{type === "destinations" ? "Destination" : type === "hotels" ? "Hotel" : "Transport"}</div>
            }
            <div className="card-body">
                <h4 className="card-title">{getItemTitle(item)}</h4>
                {getItemSubtitle(item, type) && <p className="card-subtitle">{getItemSubtitle(item, type)}</p>}
                {getItemDescription(item, type) && <p className="card-description">{getItemDescription(item, type)}</p>}
                {type === "transport" && <p className="card-availability">{item.availability ? "Available" : "Unavailable"}</p>}
            </div>
        </div>
    );
}

// Detail View with Reviews
export function DetailView({ item, type, userId, onBack, readOnly }) {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const img = getItemImage(item, type);

    useEffect(() => { loadReviews(); }, []);

    const loadReviews = async () => {
        try {
            const fetchers = { destinations: api.getReviewsByDestination, hotels: api.getReviewsByHotel, transport: api.getReviewsByTransport };
            setReviews(await fetchers[type](item.id) || []);
        } catch { setReviews([]); }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) { alert("Review cannot be empty"); return; }
        setSubmitting(true);
        try {
            const payload = { userId, comment: comment.trim() };
            if (type === "destinations") payload.destinationId = item.id;
            else if (type === "hotels") payload.hotelId = item.id;
            else if (type === "transport") payload.transportId = item.id;
            await api.createReview(payload);
            setComment("");
            loadReviews();
        } catch (err) { alert(err.message); }
        setSubmitting(false);
    };

    return (
        <div className="detail-view">
            <button className="back-btn" onClick={onBack}>← Back</button>
            <div className="detail-card">
                {img
                    ? <div className="detail-image-wrapper"><img src={img} alt={getItemTitle(item)} className="detail-image" /></div>
                    : <div className="detail-image-placeholder">{type === "destinations" ? "Destination" : type === "hotels" ? "Hotel" : "Transport"}</div>
                }
                <div className="detail-body">
                    <h2 className="detail-title">{getItemTitle(item)}</h2>
                    {getItemSubtitle(item, type) && <p className="detail-subtitle">{getItemSubtitle(item, type)}</p>}
                    {type === "destinations" && item.category && <span className="detail-tag">{item.category}</span>}
                    {type === "transport" && <p className="card-availability">{item.availability ? "Available" : "Unavailable"}</p>}
                    {getItemDescription(item, type) && <p className="detail-description">{getItemDescription(item, type)}</p>}
                </div>
            </div>

            <div className="reviews-container">
                <h3>Reviews ({reviews.length})</h3>
                {readOnly ? (
                    <p className="login-prompt">Login as a tourist to write a review</p>
                ) : (
                    <form className="review-form" onSubmit={submitReview}>
                        <textarea placeholder="Write your review..." rows="3" value={comment} onChange={e => setComment(e.target.value)} />
                        <button type="submit" disabled={submitting || !comment.trim()}>{submitting ? "Submitting..." : "Submit Review"}</button>
                    </form>
                )}
                {reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
                <div className="reviews-list">
                    {reviews.map(r => (
                        <div key={r.id} className="review-item">
                            <div className="review-header">
                                <strong>{r.userName}</strong>
                                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="review-comment">{r.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

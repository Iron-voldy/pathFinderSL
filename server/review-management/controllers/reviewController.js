const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Review = require('../models/Review');
const User = require('../../user-management/models/User');
const Hotel = require('../../hotel-accommodation-management/models/Hotel');
const Lifestyle = require('../../destination-management/models/Lifestyle');
const {
  isMailConfigured,
  sendBookingNotificationToAdmin,
  sendBookingConfirmedToUser,
} = require('../../user-management/services/mailService');

// ── Associations ──────────────────────────────────────────────
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ═══════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════

// GET /cart — list all active carts for user
exports.getCarts = async (req, res, next) => {
  try {
    const carts = await Cart.findAll({
      where: { user_id: req.user.id, status: 'active' },
      include: [{ model: CartItem, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: carts });
  } catch (err) { next(err); }
};

// POST /cart — create a new cart
exports.createCart = async (req, res, next) => {
  try {
    const { cart_name } = req.body;
    const cart = await Cart.create({
      user_id: req.user.id,
      cart_name: cart_name || 'My Cart',
    });
    res.status(201).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// GET /cart/:id — get cart with items
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: CartItem, as: 'items', order: [['created_at', 'ASC']] }],
    });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

// POST /cart/:id/items — add item to cart
exports.addCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id, status: 'active' },
    });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const {
      item_type, item_id, item_name, item_image,
      check_in, check_out, event_date,
      adult_count, child_count, unit_price, currency, notes,
    } = req.body;

    const item = await CartItem.create({
      cart_id: cart.id,
      item_type,
      item_id,
      item_name,
      item_image: item_image || null,
      check_in: check_in || null,
      check_out: check_out || null,
      event_date: event_date || null,
      adult_count: adult_count || 1,
      child_count: child_count || 0,
      unit_price: parseFloat(unit_price) || 0,
      currency: currency || 'LKR',
      notes: notes || null,
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

// PUT /cart/items/:itemId — update cart item
exports.updateCartItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId, {
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const allowed = ['check_in', 'check_out', 'event_date', 'adult_count', 'child_count', 'unit_price', 'currency', 'notes'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) item[k] = req.body[k]; });
    await item.save();

    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// DELETE /cart/items/:itemId
exports.deleteCartItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId, {
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await item.destroy();
    res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

// DELETE /cart/:id — delete entire cart
exports.deleteCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    await CartItem.destroy({ where: { cart_id: cart.id } });
    await cart.destroy();
    res.json({ success: true, message: 'Cart deleted' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// POST /orders/checkout/:cartId — create order from cart, redirect to WhatsApp
exports.checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.cartId, user_id: req.user.id, status: 'active' },
      include: [{ model: CartItem, as: 'items' }],
    });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce((s, i) => s + parseFloat(i.unit_price || 0), 0);
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      user_id: req.user.id,
      cart_id: cart.id,
      order_number: orderNumber,
      status: 'pending',
      total_amount: totalAmount,
      currency: cart.items[0]?.currency || 'LKR',
      customer_name: req.user.full_name || '',
      customer_email: req.user.email || '',
      notes: req.body.notes || null,
    });

    // Copy cart items to order items
    for (const ci of cart.items) {
      await OrderItem.create({
        order_id: order.id,
        item_type: ci.item_type,
        item_id: ci.item_id,
        item_name: ci.item_name,
        item_image: ci.item_image,
        check_in: ci.check_in,
        check_out: ci.check_out,
        event_date: ci.event_date,
        adult_count: ci.adult_count,
        child_count: ci.child_count,
        unit_price: ci.unit_price,
        currency: ci.currency,
      });
    }

    // Mark cart as checked out
    await cart.update({ status: 'checked_out' });

    // Build WhatsApp message
    const phone = '94779393662';
    let msg = `Hi! I'd like to confirm my booking.\n\nOrder: ${orderNumber}\nName: ${req.user.full_name || 'N/A'}\nEmail: ${req.user.email || 'N/A'}\n\nItems:\n`;
    cart.items.forEach((ci, idx) => {
      msg += `${idx + 1}. ${ci.item_name} (${ci.item_type})`;
      if (ci.check_in) msg += ` | ${ci.check_in} → ${ci.check_out || '?'}`;
      if (ci.event_date) msg += ` | Date: ${ci.event_date}`;
      msg += ` | Adults: ${ci.adult_count}, Children: ${ci.child_count}`;
      msg += ` | ${ci.currency} ${parseFloat(ci.unit_price).toLocaleString()}\n`;
    });
    msg += `\nTotal: ${order.currency} ${parseFloat(order.total_amount).toLocaleString()}`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    // Reload with items
    const full = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    // Send booking notification emails (fire-and-forget — don't block checkout response)
    if (isMailConfigured()) {
      const userObj = { full_name: req.user.full_name || '', email: req.user.email || '' };
      const orderWithDate = { ...full.toJSON(), created_at: full.created_at || new Date() };
      const itemsList = (full.items || []).map((i) => i.toJSON ? i.toJSON() : i);
      sendBookingNotificationToAdmin({ order: orderWithDate, items: itemsList, user: userObj })
        .then(() => console.log('[Mail] Admin booking notification sent for', orderNumber))
        .catch((err) => console.error('[Mail] Admin booking notification failed:', err.message));
    } else {
      console.warn('[Mail] Skipping admin notification — mail not configured');
    }

    res.status(201).json({ success: true, data: full, whatsapp_url: whatsappUrl });
  } catch (err) { next(err); }
};

// GET /orders — user orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// GET /orders/:id — single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }, { model: Review, as: 'reviews' }],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// GET /orders/admin/all — admin: list all orders
exports.adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// PUT /orders/admin/:id/status — admin: update order status
exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await order.update({ status });
    const full = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
      ],
    });

    // Send confirmation email to customer when admin confirms the order
    if (status === 'confirmed' && isMailConfigured() && full.user) {
      const userObj = {
        full_name: full.user.full_name || '',
        email: full.user.email || '',
      };
      const orderJson = full.toJSON();
      const itemsList = (full.items || []).map((i) => (i.toJSON ? i.toJSON() : i));
      sendBookingConfirmedToUser({ order: orderJson, items: itemsList, user: userObj }).catch((err) =>
        console.error('[Mail] Booking confirmation email failed:', err.message)
      );
    }

    res.json({ success: true, data: full });
  } catch (err) { next(err); }
};

// GET /orders/admin/stats
exports.adminGetStats = async (req, res, next) => {
  try {
    const { fn, col } = require('sequelize');
    const totalOrders = await Order.count();
    const pending     = await Order.count({ where: { status: 'pending' } });
    const confirmed   = await Order.count({ where: { status: 'confirmed' } });
    const cancelled   = await Order.count({ where: { status: 'cancelled' } });
    const revenue     = await Order.sum('total_amount', { where: { status: 'confirmed' } }) || 0;
    res.json({ success: true, data: { totalOrders, pending, confirmed, cancelled, revenue } });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════

// POST /reviews — create a review (only for confirmed orders)
exports.createReview = async (req, res, next) => {
  try {
    const { order_id, item_type, item_id, rating, comment } = req.body;

    // Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required.' });
    }
    if (comment.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Comment must be at least 5 characters.' });
    }
    if (comment.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Comment must be under 500 characters.' });
    }

    // Verify order belongs to user and is confirmed
    const order = await Order.findOne({
      where: { id: order_id, user_id: req.user.id, status: 'confirmed' },
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) {
      return res.status(400).json({ success: false, message: 'Order not found or not confirmed' });
    }

    // Verify the item was in this order
    const orderHasItem = order.items.some(
      (oi) => oi.item_type === item_type && oi.item_id === Number(item_id)
    );
    if (!orderHasItem) {
      return res.status(400).json({ success: false, message: 'Item not in this order' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({
      where: { user_id: req.user.id, order_id, item_type, item_id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already reviewed this item' });
    }

    const review = await Review.create({
      user_id: req.user.id,
      order_id,
      item_type,
      item_id,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment: comment || null,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

// GET /reviews/:itemType/:itemId — public: get reviews for a hotel/lifestyle
exports.getItemReviews = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.params;
    const reviews = await Review.findAll({
      where: { item_type: itemType, item_id: itemId },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'profile_picture'] }],
      order: [['created_at', 'DESC']],
    });

    const count = reviews.length;
    const avgRating = count > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
      : 0;

    res.json({ success: true, data: { reviews, count, avgRating: parseFloat(avgRating) } });
  } catch (err) { next(err); }
};

// GET /reviews/user — get all reviews by current user
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Order, as: 'Order', attributes: ['id', 'order_number'] }],
      order: [['created_at', 'DESC']],
    });

    // Enrich with item names and images
    const hotelIds = [...new Set(reviews.filter(r => r.item_type === 'hotel').map(r => r.item_id))];
    const lifestyleIds = [...new Set(reviews.filter(r => r.item_type === 'lifestyle').map(r => r.item_id))];

    const [hotels, lifestyles] = await Promise.all([
      hotelIds.length ? Hotel.findAll({ where: { id: hotelIds }, attributes: ['id', 'hotel_name', 'hotel_image'] }) : [],
      lifestyleIds.length ? Lifestyle.findAll({ where: { lifestyle_id: lifestyleIds }, attributes: ['lifestyle_id', 'lifestyle_name', 'image'] }) : [],
    ]);

    const hotelMap = Object.fromEntries(hotels.map(h => [h.id, h]));
    const lifestyleMap = Object.fromEntries(lifestyles.map(l => [l.lifestyle_id, l]));

    const enriched = reviews.map(r => {
      const plain = r.toJSON();
      if (r.item_type === 'hotel' && hotelMap[r.item_id]) {
        plain.item_name = hotelMap[r.item_id].hotel_name;
        plain.item_image = hotelMap[r.item_id].hotel_image;
      } else if (r.item_type === 'lifestyle' && lifestyleMap[r.item_id]) {
        plain.item_name = lifestyleMap[r.item_id].lifestyle_name;
        plain.item_image = lifestyleMap[r.item_id].image;
      }
      return plain;
    });

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
};

// DELETE /reviews/:id — delete user's own review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findOne({ where: { id, user_id: req.user.id } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await review.destroy();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// PUT /reviews/:id — update user's own review
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ where: { id, user_id: req.user.id } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.update({
      ...(rating !== undefined && { rating: Math.min(5, Math.max(1, parseInt(rating))) }),
      ...(comment !== undefined && { comment }),
    });

    res.json({ success: true, data: review });
  } catch (err) { next(err); }
};

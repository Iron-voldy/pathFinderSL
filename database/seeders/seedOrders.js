/**
 * Seed sample orders & reviews for testing
 *
 * Usage:  node database/seeders/seedOrders.js
 *
 * Pre-requisites:
 *   - Server must have been started at least once so that
 *     carts, cart_items, orders, order_items, reviews tables exist.
 *   - At least one user row (id 1) and one admin row (id 2) in `users`.
 *   - Hotels (id 1,2) and lifestyles (id 1,2) should exist.
 *
 * If IDs differ in your DB, tweak the constants below.
 */

const path = require('path');
const serverDir = path.join(__dirname, '../../server');
module.paths.unshift(path.join(serverDir, 'node_modules'));

require('dotenv').config({ path: path.join(serverDir, '.env') });
const sequelize = require(path.join(serverDir, 'config/database'));

const Cart     = require(path.join(serverDir, 'review-management/models/Cart'));
const CartItem = require(path.join(serverDir, 'review-management/models/CartItem'));
const Order    = require(path.join(serverDir, 'review-management/models/Order'));
const OrderItem= require(path.join(serverDir, 'review-management/models/OrderItem'));
const Review   = require(path.join(serverDir, 'review-management/models/Review'));

// ── Tweak these if your DB has different IDs ──────────────────
const USER_ID = 1;        // A normal user
const HOTEL_1 = { id: 1, name: 'Shangri-La Hotel Colombo',   image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80' };
const HOTEL_2 = { id: 2, name: 'Cinnamon Grand Colombo',     image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80' };
const LIFE_1  = { id: 1, name: 'Sigiriya Rock Fortress Tour', image: null };
const LIFE_2  = { id: 2, name: 'Ella Nine Arches Bridge Hike', image: null };

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅  DB connected');

    // Sync tables (alter just in case)
    await Cart.sync({ alter: true });
    await CartItem.sync({ alter: true });
    await Order.sync({ alter: true });
    await OrderItem.sync({ alter: true });
    await Review.sync({ alter: true });

    // ── Clean previous sample data (idempotent) ───────────────
    await Review.destroy({ where: { user_id: USER_ID } });
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: { user_id: USER_ID } });
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: { user_id: USER_ID } });
    console.log('🗑️  Cleared old sample data');

    // ── Cart 1 (already checked out → becomes Order 1) ───────
    const cart1 = await Cart.create({ user_id: USER_ID, cart_name: 'My Cart', status: 'checked_out' });
    await CartItem.bulkCreate([
      { cart_id: cart1.id, item_type: 'hotel', item_id: HOTEL_1.id, item_name: HOTEL_1.name, item_image: HOTEL_1.image, check_in: '2025-08-01', check_out: '2025-08-04', adult_count: 2, child_count: 1, unit_price: 45000, currency: 'LKR' },
      { cart_id: cart1.id, item_type: 'lifestyle', item_id: LIFE_1.id, item_name: LIFE_1.name, item_image: LIFE_1.image, event_date: '2025-08-02', adult_count: 2, child_count: 1, unit_price: 8500, currency: 'LKR' },
    ]);

    // Order 1 → confirmed (can receive reviews)
    const order1 = await Order.create({
      user_id: USER_ID, cart_id: cart1.id, order_number: 'ORD-SAMPLE-001', status: 'confirmed',
      total_amount: 53500, currency: 'LKR', customer_name: 'Sample User', customer_email: 'user@test.com',
    });
    await OrderItem.bulkCreate([
      { order_id: order1.id, item_type: 'hotel', item_id: HOTEL_1.id, item_name: HOTEL_1.name, item_image: HOTEL_1.image, check_in: '2025-08-01', check_out: '2025-08-04', adult_count: 2, child_count: 1, unit_price: 45000, currency: 'LKR' },
      { order_id: order1.id, item_type: 'lifestyle', item_id: LIFE_1.id, item_name: LIFE_1.name, item_image: LIFE_1.image, event_date: '2025-08-02', adult_count: 2, child_count: 1, unit_price: 8500, currency: 'LKR' },
    ]);
    console.log('📦  Order 1 (confirmed):', order1.order_number);

    // ── Cart 2 (checked out → becomes Order 2) ───────────────
    const cart2 = await Cart.create({ user_id: USER_ID, cart_name: 'Weekend Trip', status: 'checked_out' });
    await CartItem.bulkCreate([
      { cart_id: cart2.id, item_type: 'hotel', item_id: HOTEL_2.id, item_name: HOTEL_2.name, item_image: HOTEL_2.image, check_in: '2025-09-10', check_out: '2025-09-12', adult_count: 1, child_count: 0, unit_price: 28000, currency: 'LKR' },
    ]);

    // Order 2 → pending
    const order2 = await Order.create({
      user_id: USER_ID, cart_id: cart2.id, order_number: 'ORD-SAMPLE-002', status: 'pending',
      total_amount: 28000, currency: 'LKR', customer_name: 'Sample User', customer_email: 'user@test.com',
    });
    await OrderItem.bulkCreate([
      { order_id: order2.id, item_type: 'hotel', item_id: HOTEL_2.id, item_name: HOTEL_2.name, item_image: HOTEL_2.image, check_in: '2025-09-10', check_out: '2025-09-12', adult_count: 1, child_count: 0, unit_price: 28000, currency: 'LKR' },
    ]);
    console.log('📦  Order 2 (pending):', order2.order_number);

    // ── Cart 3 (checked out → Order 3 cancelled) ─────────────
    const cart3 = await Cart.create({ user_id: USER_ID, cart_name: 'My Cart', status: 'checked_out' });
    await CartItem.bulkCreate([
      { cart_id: cart3.id, item_type: 'lifestyle', item_id: LIFE_2.id, item_name: LIFE_2.name, item_image: LIFE_2.image, event_date: '2025-07-20', adult_count: 3, child_count: 0, unit_price: 6000, currency: 'LKR' },
    ]);

    const order3 = await Order.create({
      user_id: USER_ID, cart_id: cart3.id, order_number: 'ORD-SAMPLE-003', status: 'cancelled',
      total_amount: 6000, currency: 'LKR', customer_name: 'Sample User', customer_email: 'user@test.com',
    });
    await OrderItem.bulkCreate([
      { order_id: order3.id, item_type: 'lifestyle', item_id: LIFE_2.id, item_name: LIFE_2.name, item_image: LIFE_2.image, event_date: '2025-07-20', adult_count: 3, child_count: 0, unit_price: 6000, currency: 'LKR' },
    ]);
    console.log('📦  Order 3 (cancelled):', order3.order_number);

    // ── Cart 4 (active — still in cart, not checked out) ──────
    const cart4 = await Cart.create({ user_id: USER_ID, cart_name: 'My Cart', status: 'active' });
    await CartItem.bulkCreate([
      { cart_id: cart4.id, item_type: 'hotel', item_id: HOTEL_1.id, item_name: HOTEL_1.name, item_image: HOTEL_1.image, check_in: '2025-10-05', check_out: '2025-10-08', adult_count: 2, child_count: 2, unit_price: 45000, currency: 'LKR' },
      { cart_id: cart4.id, item_type: 'lifestyle', item_id: LIFE_2.id, item_name: LIFE_2.name, item_image: LIFE_2.image, event_date: '2025-10-06', adult_count: 2, child_count: 2, unit_price: 6000, currency: 'LKR' },
    ]);
    console.log('🛒  Cart 4 (active — in cart)');

    // ── Sample reviews (only on confirmed Order 1) ────────────
    await Review.bulkCreate([
      { user_id: USER_ID, order_id: order1.id, item_type: 'hotel', item_id: HOTEL_1.id, rating: 5, comment: 'Amazing hotel, the ocean view was breathtaking. Staff were incredibly friendly and helpful!' },
      { user_id: USER_ID, order_id: order1.id, item_type: 'lifestyle', item_id: LIFE_1.id, rating: 4, comment: 'Great experience climbing Sigiriya. The guide was very knowledgeable. Bring water!' },
    ]);
    console.log('⭐  2 sample reviews created');

    console.log('\n🎉  Sample data seeded successfully!');
    console.log('    → 4 carts (3 checked out, 1 active)');
    console.log('    → 3 orders (1 confirmed, 1 pending, 1 cancelled)');
    console.log('    → 2 reviews on the confirmed order');
    console.log('    → 1 active cart with 2 items ready for checkout');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  }
}

seed();


const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('../controllers/reviewController');

// ── Cart routes (all require auth) ────────────────────────────
router.get('/cart', authenticate, ctrl.getCarts);
router.post('/cart', authenticate, ctrl.createCart);
router.get('/cart/:id', authenticate, ctrl.getCart);
router.post('/cart/:id/items', authenticate, ctrl.addCartItem);
router.put('/cart/items/:itemId', authenticate, ctrl.updateCartItem);
router.delete('/cart/items/:itemId', authenticate, ctrl.deleteCartItem);
router.delete('/cart/:id', authenticate, ctrl.deleteCart);

// ── Order routes ──────────────────────────────────────────────
router.post('/orders/checkout/:cartId', authenticate, ctrl.checkout);
router.get('/orders', authenticate, ctrl.getOrders);
router.get('/orders/:id', authenticate, ctrl.getOrder);

// ── Order admin routes ────────────────────────────────────────
router.get('/orders/admin/all', authenticate, authorize('admin'), ctrl.adminGetOrders);
router.get('/orders/admin/stats', authenticate, authorize('admin'), ctrl.adminGetStats);
router.put('/orders/admin/:id/status', authenticate, authorize('admin'), ctrl.adminUpdateStatus);

// ── Review routes ─────────────────────────────────────────────
router.post('/reviews', authenticate, ctrl.createReview);
router.get('/reviews/user', authenticate, ctrl.getUserReviews);
router.put('/reviews/:id', authenticate, ctrl.updateReview);
router.delete('/reviews/:id', authenticate, ctrl.deleteReview);
router.get('/reviews/:itemType/:itemId', ctrl.getItemReviews); // public

module.exports = router;

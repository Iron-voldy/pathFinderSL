const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const {
  getMyPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  addItem,
  updateItem,
  deleteItem,
  exportBudgetReport,
  adminGetAllPlans,
  adminGetStats,
} = require('../controllers/budgetController');

// All budget routes require authentication
router.use(authenticate);

// ── User plan routes ──────────────────────────────────────
router.get('/plans', getMyPlans);
router.post('/plans', createPlan);
router.get('/plans/:id', getPlanById);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// ── User report route ─────────────────────────────────────
router.get('/plans/:planId/report', exportBudgetReport);

// ── User item routes ──────────────────────────────────────
router.post('/plans/:planId/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

// ── Admin routes ──────────────────────────────────────────
router.get('/admin/plans', authorize('admin'), adminGetAllPlans);
router.get('/admin/stats', authorize('admin'), adminGetStats);

module.exports = router;

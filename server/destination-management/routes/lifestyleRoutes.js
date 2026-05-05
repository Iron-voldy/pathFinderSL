const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const {
  getAllLifestyles,
  getLifestyleById,
  createLifestyle,
  updateLifestyle,
  deleteLifestyle,
} = require('../controllers/lifestyleController');

/* Public */
router.get('/', getAllLifestyles);
router.get('/:id', getLifestyleById);

/* Admin only */
router.post('/', authenticate, authorize('admin'), createLifestyle);
router.put('/:id', authenticate, authorize('admin'), updateLifestyle);
router.delete('/:id', authenticate, authorize('admin'), deleteLifestyle);

module.exports = router;

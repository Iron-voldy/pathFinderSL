const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');

/* Public */
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

/* Admin only */
router.post('/', authenticate, authorize('admin'), createDestination);
router.put('/:id', authenticate, authorize('admin'), updateDestination);
router.delete('/:id', authenticate, authorize('admin'), deleteDestination);

module.exports = router;

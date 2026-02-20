const express = require('express');
const router = express.Router();
const {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  permanentDeleteHotel,
  restoreHotel,
  getHotelsByLocation,
  getHotelStats
} = require('../controllers/hotelController');
const { validateRequest } = require('../../middleware/validateRequest');
const {
  createHotelSchema,
  updateHotelSchema,
  queryParamsSchema,
  idParamSchema
} = require('../validations/hotelValidation');

/**
 * Hotel Routes
 * Base URL: /api/hotels
 */

// @route   POST /api/hotels
// @desc    Create a new hotel
// @access  Admin
router.post(
  '/',
  validateRequest({ body: createHotelSchema }),
  createHotel
);

// @route   GET /api/hotels
// @desc    Get all hotels (with pagination, filtering, search)
// @access  Public
router.get(
  '/',
  validateRequest({ query: queryParamsSchema }),
  getAllHotels
);

// @route   GET /api/hotels/stats/summary
// @desc    Get hotel statistics
// @access  Admin
router.get('/stats/summary', getHotelStats);

// @route   GET /api/hotels/location/:location
// @desc    Get hotels by location
// @access  Public
router.get('/location/:location', getHotelsByLocation);

// @route   GET /api/hotels/:id
// @desc    Get a single hotel by ID
// @access  Public
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  getHotelById
);

// @route   PUT /api/hotels/:id
// @desc    Update a hotel
// @access  Admin
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateHotelSchema }),
  updateHotel
);

// @route   DELETE /api/hotels/:id
// @desc    Soft delete a hotel
// @access  Admin
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  deleteHotel
);

// @route   DELETE /api/hotels/:id/permanent
// @desc    Permanently delete a hotel
// @access  Super Admin
router.delete(
  '/:id/permanent',
  validateRequest({ params: idParamSchema }),
  permanentDeleteHotel
);

// @route   POST /api/hotels/:id/restore
// @desc    Restore a soft-deleted hotel
// @access  Admin
router.post(
  '/:id/restore',
  validateRequest({ params: idParamSchema }),
  restoreHotel
);

module.exports = router;

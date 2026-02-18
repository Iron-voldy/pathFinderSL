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
  getHotelStats,
  uploadHotelImage
} = require('../controllers/hotelController');
const { validateRequest } = require('../../middleware/validateRequest');
const {
  createHotelSchema,
  updateHotelSchema,
  queryParamsSchema,
  idParamSchema
} = require('../validations/hotelValidation');

// POST /api/hotels — create hotel
router.post(
  '/',
  validateRequest({ body: createHotelSchema }),
  createHotel
);

// GET /api/hotels — list with pagination and filters
router.get(
  '/',
  validateRequest({ query: queryParamsSchema }),
  getAllHotels
);

// GET /api/hotels/stats/summary
router.get('/stats/summary', getHotelStats);

// POST /api/hotels/upload-image
router.post('/upload-image', uploadHotelImage);

// GET /api/hotels/location/:location
router.get('/location/:location', getHotelsByLocation);

// GET /api/hotels/:id
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  getHotelById
);

// PUT /api/hotels/:id
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateHotelSchema }),
  updateHotel
);

// @route   DELETE /api/hotels/:id
// DELETE /api/hotels/:id — soft delete
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  deleteHotel
);

// DELETE /api/hotels/:id/permanent — hard delete
router.delete(
  '/:id/permanent',
  validateRequest({ params: idParamSchema }),
  permanentDeleteHotel
);

// POST /api/hotels/:id/restore
router.post(
  '/:id/restore',
  validateRequest({ params: idParamSchema }),
  restoreHotel
);

module.exports = router;

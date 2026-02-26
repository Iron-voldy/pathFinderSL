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
} = require('../controllers/hotelController');
const { validateRequest } = require('../../middleware/validateRequest');
const { authenticate, authorize } = require('../../middleware/auth');
const uploadHotelImage = require('../middleware/uploadHotelImage');
const {
  createHotelSchema,
  updateHotelSchema,
  queryParamsSchema,
  idParamSchema,
} = require('../validations/hotelValidation');

// Helper: run multer and inject file path into req.body before validation
const handleHotelImageUpload = (req, res, next) => {
  uploadHotelImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (req.file) {
      req.body.hotel_image = `/uploads/hotels/${req.file.filename}`;
    }
    next();
  });
};

router.post(
  '/',
  authenticate,
  authorize('admin'),
  handleHotelImageUpload,
  validateRequest({ body: createHotelSchema }),
  createHotel
);

router.get('/', validateRequest({ query: queryParamsSchema }), getAllHotels);

router.get('/stats/summary', authenticate, authorize('admin'), getHotelStats);

router.get('/location/:location', getHotelsByLocation);

router.get('/:id', validateRequest({ params: idParamSchema }), getHotelById);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  handleHotelImageUpload,
  validateRequest({ params: idParamSchema, body: updateHotelSchema }),
  updateHotel
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ params: idParamSchema }),
  deleteHotel
);

router.delete(
  '/:id/permanent',
  authenticate,
  authorize('admin'),
  validateRequest({ params: idParamSchema }),
  permanentDeleteHotel
);

router.post(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  validateRequest({ params: idParamSchema }),
  restoreHotel
);

module.exports = router;

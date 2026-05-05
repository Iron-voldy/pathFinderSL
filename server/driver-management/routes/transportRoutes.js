const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validateRequest');
const uploadLicense = require('../middleware/uploadLicense');
const uploadGigImages = require('../middleware/uploadGigImages');
const {
  applyAsDriver,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
  getAllGigs,
  getGigById,
  createBooking,
  updateBooking,
  getMyBookings,
  getDriverBookings,
  updateBookingStatus,
  cancelBooking,
  getDriverStats,
  getAdminTransportStats,
} = require('../controllers/transportController');
const {
  driverApplicationSchema,
  reviewApplicationSchema,
  createGigSchema,
  updateGigSchema,
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  idParamSchema,
  gigQuerySchema,
} = require('../validations/transportValidation');

/* ─── Driver Application (with license file upload) ─── */
router.post(
  '/driver/apply',
  authenticate,
  (req, res, next) => {
    uploadLicense(req, res, (err) => {
      if (err) {
        console.error('Multer upload error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  applyAsDriver
);

router.get('/driver/application', authenticate, getMyApplication);

/* ─── Admin: applications ─── */
router.get('/admin/applications', authenticate, authorize('admin'), getAllApplications);

router.put(
  '/admin/applications/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ params: idParamSchema, body: reviewApplicationSchema }),
  reviewApplication
);

router.get('/admin/stats', authenticate, authorize('admin'), getAdminTransportStats);

/* ─── Driver: gig management ─── */
router.post(
  '/driver/gigs',
  authenticate,
  (req, res, next) => {
    uploadGigImages(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  validateRequest({ body: createGigSchema }),
  createGig
);

router.get('/driver/gigs', authenticate, getMyGigs);

router.put(
  '/driver/gigs/:id',
  authenticate,
  (req, res, next) => {
    uploadGigImages(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  validateRequest({ params: idParamSchema, body: updateGigSchema }),
  updateGig
);

router.delete(
  '/driver/gigs/:id',
  authenticate,
  validateRequest({ params: idParamSchema }),
  deleteGig
);

/* ─── Driver: bookings & stats ─── */
router.get('/driver/bookings', authenticate, getDriverBookings);

router.put(
  '/driver/bookings/:id/status',
  authenticate,
  validateRequest({ params: idParamSchema, body: updateBookingStatusSchema }),
  updateBookingStatus
);

router.get('/driver/stats', authenticate, getDriverStats);

/* ─── Public: browse gigs ─── */
router.get('/gigs', validateRequest({ query: gigQuerySchema }), getAllGigs);

router.get('/gigs/:id', validateRequest({ params: idParamSchema }), getGigById);

/* ─── Client: bookings ─── */
router.post(
  '/bookings',
  authenticate,
  validateRequest({ body: createBookingSchema }),
  createBooking
);

router.get('/bookings', authenticate, getMyBookings);

router.put(
  '/bookings/:id',
  authenticate,
  validateRequest({ params: idParamSchema, body: updateBookingSchema }),
  updateBooking
);

router.put(
  '/bookings/:id/cancel',
  authenticate,
  validateRequest({ params: idParamSchema }),
  cancelBooking
);

module.exports = router;

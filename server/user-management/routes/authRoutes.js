const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getAllUsers,
} = require('../controllers/authController');
const { validateRequest } = require('../../middleware/validateRequest');
const { authenticate, authorize } = require('../../middleware/auth');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateProfileSchema,
  deleteAccountSchema,
} = require('../validations/authValidation');

router.post('/register', validateRequest({ body: registerSchema }), registerUser);
router.post('/user/login', validateRequest({ body: loginSchema }), loginUser);
router.post('/admin/login', validateRequest({ body: loginSchema }), loginAdmin);
router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword
);
router.post('/verify-otp', validateRequest({ body: verifyOtpSchema }), verifyResetOtp);
router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema }),
  resetPassword
);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, validateRequest({ body: updateProfileSchema }), updateProfile);
router.delete('/account', authenticate, validateRequest({ body: deleteAccountSchema }), deleteAccount);

// Admin routes
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);

module.exports = router;

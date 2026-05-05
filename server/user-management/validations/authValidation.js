const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    'string.pattern.base':
      'Password must include at least one uppercase letter, one lowercase letter, and one number',
  });

const emailSchema = Joi.string().trim().email().required();

const portalSchema = Joi.string().valid('user', 'admin').default('user');

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(120).required(),
  email: emailSchema,
  password: passwordSchema.required(),
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
  portal: portalSchema,
});

const verifyOtpSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().trim().pattern(/^\d{6}$/).required(),
  portal: portalSchema,
});

const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().trim().required(),
  newPassword: passwordSchema.required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(120).optional(),
  nationality: Joi.string().trim().max(80).allow('', null).optional(),
  location: Joi.string().trim().max(160).allow('', null).optional(),
  profilePicture: Joi.string().trim().max(2048).allow('', null).optional(),
}).min(1);

const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateProfileSchema,
  deleteAccountSchema,
};

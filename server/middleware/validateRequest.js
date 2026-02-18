/**
 * Request Validation Middleware
 * Validates request body, params, and query using Joi schemas
 */

const validateRequest = (schemas) => {
  return (req, res, next) => {
    const errors = {};

    // Validate request body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        errors.body = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      } else {
        req.body = value; // Use validated and sanitized data
      }
    }

    // Validate request params
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false
      });

      if (error) {
        errors.params = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      } else {
        req.params = value;
      }
    }

    // Validate query parameters
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        errors.query = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      } else {
        req.query = value;
      }
    }

    // If there are validation errors, return 400
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = { validateRequest };

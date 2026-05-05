const Joi = require('joi');

const STAR_QUERY_VALUES = ['1', '2', '3', '4', '5', '1-star', '2-star', '3-star', '4-star', '5-star', 'Unrated'];

/**
 * Validation Schemas for Hotel Management
 * Using Joi for request validation
 */

// Create Hotel Validation
const createHotelSchema = Joi.object({
  hotel_name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Hotel name is required',
      'string.min': 'Hotel name must be at least 3 characters',
      'any.required': 'Hotel name is required'
    }),
  
  hotel_description: Joi.string()
    .allow('', null)
    .max(5000)
    .messages({
      'string.max': 'Description must not exceed 5000 characters'
    }),
  
  star_classification: Joi.string()
    .valid('1-star', '2-star', '3-star', '4-star', '5-star', 'Unrated')
    .allow(null)
    .messages({
      'any.only': 'Invalid star classification'
    }),
  
  auto_confirmation: Joi.number()
    .integer()
    .valid(0, 1)
    .default(0)
    .messages({
      'any.only': 'Auto confirmation must be 0 or 1'
    }),
  
  hotel_classification: Joi.string()
    .valid('Hotel', 'Resort', 'Villa', 'Guesthouse', 'Apartment', 'Hostel', 'Boutique', 'Other')
    .allow(null)
    .messages({
      'any.only': 'Invalid hotel classification'
    }),
  
  longitude: Joi.string()
    .pattern(/^-?([0-9]{1,3}\.?[0-9]*)$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Invalid longitude format'
    }),
  
  latitude: Joi.string()
    .pattern(/^-?([0-9]{1,2}\.?[0-9]*)$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Invalid latitude format'
    }),
  
  provider: Joi.string()
    .max(45)
    .allow('', null),
  
  hotel_address: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'string.empty': 'Hotel address is required',
      'string.min': 'Address must be at least 10 characters',
      'any.required': 'Hotel address is required'
    }),
  
  trip_advisor_link: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'Must be a valid URL'
    }),
  
  hotel_image: Joi.string()
    .allow('', null)
    .messages({
      'string.uri': 'Hotel image must be a valid path or URL'
    }),
  
  country: Joi.string()
    .max(45)
    .default('Sri Lanka')
    .allow(null),
  
  city: Joi.string()
    .max(45)
    .allow('', null),
  
  micro_location: Joi.string()
    .max(45)
    .allow('', null),
  
  hotel_status: Joi.string()
    .valid('active', 'inactive', 'pending', 'maintenance')
    .default('active')
    .messages({
      'any.only': 'Invalid hotel status'
    }),
  
  start_date: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),
  
  end_date: Joi.date()
    .iso()
    .min(Joi.ref('start_date'))
    .allow(null)
    .messages({
      'date.min': 'End date must be after start date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)'
    }),
  
  vendor_id: Joi.number()
    .integer()
    .positive()
    .allow(null),
  
  markup: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.min': 'Price per night must be at least 0'
    }),
  
  sub_description: Joi.string()
    .max(500)
    .allow('', null)
});

// Update Hotel Validation (all fields optional)
const updateHotelSchema = Joi.object({
  hotel_name: Joi.string()
    .min(3)
    .max(255)
    .messages({
      'string.min': 'Hotel name must be at least 3 characters'
    }),
  
  hotel_description: Joi.string()
    .allow('', null)
    .max(5000),
  
  star_classification: Joi.string()
    .valid('1-star', '2-star', '3-star', '4-star', '5-star', 'Unrated')
    .allow(null, ''),
  
  auto_confirmation: Joi.number()
    .integer()
    .valid(0, 1)
    .allow(null),
  
  hotel_classification: Joi.string()
    .valid('Hotel', 'Resort', 'Villa', 'Guesthouse', 'Apartment', 'Hostel', 'Boutique', 'Other')
    .allow(null, ''),
  
  longitude: Joi.string()
    .pattern(/^-?([0-9]{1,3}\.?[0-9]*)$/)
    .allow('', null),
  
  latitude: Joi.string()
    .pattern(/^-?([0-9]{1,2}\.?[0-9]*)$/)
    .allow('', null),
  
  provider: Joi.string()
    .max(45)
    .allow('', null),
  
  hotel_address: Joi.string()
    .max(500)
    .allow('', null),
  
  trip_advisor_link: Joi.string()
    .allow('', null),
  
  hotel_image: Joi.string(),
  
  country: Joi.string()
    .max(45)
    .allow('', null),
  
  city: Joi.string()
    .max(45)
    .allow('', null),
  
  micro_location: Joi.string()
    .max(45)
    .allow('', null),
  
  hotel_status: Joi.string()
    .lowercase()
    .valid('active', 'inactive', 'pending', 'maintenance')
    .allow(null, ''),
  
  start_date: Joi.date()
    .iso()
    .allow(null),
  
  end_date: Joi.date()
    .iso()
    .allow(null),
  
  vendor_id: Joi.number()
    .integer()
    .positive()
    .allow(null),
  
  markup: Joi.number()
    .min(0),
  
  sub_description: Joi.string()
    .max(500)
    .allow('', null),
  
  updated_by: Joi.number()
    .integer()
    .positive()
    .allow(null)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Query Parameters Validation (for filtering/search)
const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  city: Joi.string()
    .max(45)
    .allow(''),
  
  country: Joi.string()
    .max(45)
    .allow(''),
  
  star_classification: Joi.string()
    .valid(...STAR_QUERY_VALUES)
    .allow(''),
  
  hotel_status: Joi.string()
    .valid('active', 'inactive', 'pending', 'maintenance')
    .allow(''),
  
  hotel_classification: Joi.string()
    .allow(''),
  
  search: Joi.string()
    .max(100)
    .allow(''),
  
  sortBy: Joi.string()
    .valid('hotel_name', 'star_classification', 'city', 'created_at', 'updated_at')
    .default('created_at'),
  
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
});

// ID Parameter Validation
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Hotel ID must be a number',
      'number.positive': 'Hotel ID must be positive',
      'any.required': 'Hotel ID is required'
    })
});

module.exports = {
  createHotelSchema,
  updateHotelSchema,
  queryParamsSchema,
  idParamSchema
};

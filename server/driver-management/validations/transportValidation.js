const Joi = require('joi');

const vehicleTypes = [
  'Hatchback', 'Sedan', 'Luxury Car',
  'SUV', '4WD', 'MPV/Minivan',
  'Passenger Van', 'Mini Coach', 'Tour Bus',
  'Campervan', 'Open-top Safari', 'Convertible',
];

const vehicleCategories = [
  'Small Group (1-4)',
  'Medium Group (5-7)',
  'Large Group (8-30+)',
  'Specialized',
];

const driverApplicationSchema = Joi.object({
  driving_license_front: Joi.string().required().messages({ 'any.required': 'Driving license front image is required' }),
  driving_license_back: Joi.string().allow('', null),
  vehicle_type: Joi.string().valid(...vehicleTypes).required(),
  vehicle_make: Joi.string().max(60).required(),
  vehicle_model: Joi.string().max(60).required(),
  vehicle_year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).allow(null),
  vehicle_plate: Joi.string().max(30).required(),
  vehicle_color: Joi.string().max(30).allow('', null),
  passenger_capacity: Joi.number().integer().min(1).max(50).required(),
  vehicle_images: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow(null),
  vehicle_description: Joi.string().max(2000).allow('', null),
});

const reviewApplicationSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  admin_notes: Joi.string().max(1000).allow('', null),
});

const createGigSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(3000).allow('', null),
  start_location: Joi.string().max(200).required(),
  end_location: Joi.string().max(200).required(),
  vehicle_category: Joi.string().valid(...vehicleCategories).required(),
  vehicle_type: Joi.string().valid(...vehicleTypes).required(),
  vehicle_make: Joi.string().max(60).allow('', null),
  vehicle_model: Joi.string().max(60).allow('', null),
  passenger_capacity: Joi.number().integer().min(1).max(50).required(),
  price_per_day: Joi.number().precision(2).min(0).required(),
  currency: Joi.string().max(10).default('LKR'),
  images: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow(null),
  available_from: Joi.date().allow(null, ''),
  available_to: Joi.date().allow(null, ''),
  status: Joi.string().valid('active', 'inactive').default('active'),
  is_featured: Joi.boolean().truthy('true').falsy('false', '').default(false),
});

const updateGigSchema = createGigSchema.fork(
  ['title', 'start_location', 'end_location', 'vehicle_category', 'vehicle_type', 'passenger_capacity', 'price_per_day'],
  (field) => field.optional()
);

const createBookingSchema = Joi.object({
  gig_id: Joi.number().integer().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
  passenger_count: Joi.number().integer().min(1).required(),
  pickup_location: Joi.string().max(200).required(),
  dropoff_location: Joi.string().max(200).required(),
  notes: Joi.string().max(1000).allow('', null),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled', 'completed').required(),
});

const updateBookingSchema = Joi.object({
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
  passenger_count: Joi.number().integer().min(1).required(),
  pickup_location: Joi.string().max(200).required(),
  dropoff_location: Joi.string().max(200).required(),
  notes: Joi.string().max(1000).allow('', null),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const gigQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().max(200).allow(''),
  start_location: Joi.string().max(200).allow(''),
  end_location: Joi.string().max(200).allow(''),
  vehicle_category: Joi.string().valid(...vehicleCategories).allow(''),
  vehicle_type: Joi.string().allow(''),
  min_capacity: Joi.number().integer().min(1).allow(''),
  max_price: Joi.number().min(0).allow(''),
  date: Joi.date().allow(''),
  sortBy: Joi.string().valid('created_at', 'price_per_day', 'passenger_capacity').default('created_at'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
});

module.exports = {
  driverApplicationSchema,
  reviewApplicationSchema,
  createGigSchema,
  updateGigSchema,
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  idParamSchema,
  gigQuerySchema,
};

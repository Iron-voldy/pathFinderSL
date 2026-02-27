const Hotel = require('../models/Hotel');
const { Op } = require('sequelize');

/**
 * Hotel Controller - CRUD Operations
 * Handles all business logic for hotel management
 */

/**
 * @desc    Create a new hotel
 * @route   POST /api/hotels
 * @access  Admin
 */
const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    
    // Create hotel in database
    const hotel = await Hotel.create(hotelData);
    
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Create Hotel Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Get all hotels with pagination and filtering
 * @route   GET /api/hotels
 * @access  Public
 */
const getAllHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      country,
      star_classification,
      hotel_status,
      hotel_classification,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereClause = {};

    // Filter by city
    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }

    // Filter by country
    if (country) {
      whereClause.country = { [Op.like]: `%${country}%` };
    }

    // Filter by star classification
    if (star_classification) {
      whereClause.star_classification = star_classification;
    }

    // Filter by hotel status
    if (hotel_status) {
      whereClause.hotel_status = hotel_status;
    }

    // Filter by hotel classification
    if (hotel_classification) {
      whereClause.hotel_classification = hotel_classification;
    }

    // Search functionality (searches in name, description, address)
    if (search) {
      whereClause[Op.or] = [
        { hotel_name: { [Op.like]: `%${search}%` } },
        { hotel_description: { [Op.like]: `%${search}%` } },
        { hotel_address: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch hotels with pagination
    const { count, rows: hotels } = await Hotel.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['deleted_at'] }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Hotels retrieved successfully',
      data: hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get All Hotels Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotels',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single hotel by ID
 * @route   GET /api/hotels/:id
 * @access  Public
 */
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByPk(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel retrieved successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Get Hotel By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Update a hotel
 * @route   PUT /api/hotels/:id
 * @access  Admin
 */
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if hotel exists
    const hotel = await Hotel.findByPk(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Update hotel
    await hotel.update(updateData);

    // Fetch updated hotel
    const updatedHotel = await Hotel.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: updatedHotel
    });
  } catch (error) {
    console.error('Update Hotel Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Soft delete a hotel
 * @route   DELETE /api/hotels/:id
 * @access  Admin
 */
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const hotel = await Hotel.findByPk(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Soft delete (sets deleted_at timestamp)
    await hotel.destroy();

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
      data: { id: hotel.id }
    });
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Permanently delete a hotel (hard delete)
 * @route   DELETE /api/hotels/:id/permanent
 * @access  Super Admin
 */
const permanentDeleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if hotel exists (including soft-deleted)
    const hotel = await Hotel.findByPk(id, { paranoid: false });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Permanent delete (removes from database)
    await hotel.destroy({ force: true });

    res.status(200).json({
      success: true,
      message: 'Hotel permanently deleted',
      data: { id: hotel.id }
    });
  } catch (error) {
    console.error('Permanent Delete Hotel Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Restore a soft-deleted hotel
 * @route   POST /api/hotels/:id/restore
 * @access  Admin
 */
const restoreHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Find soft-deleted hotel
    const hotel = await Hotel.findByPk(id, { paranoid: false });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.deleted_at) {
      return res.status(400).json({
        success: false,
        message: 'Hotel is not deleted'
      });
    }

    // Restore hotel
    await hotel.restore();

    res.status(200).json({
      success: true,
      message: 'Hotel restored successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Restore Hotel Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore hotel',
      error: error.message
    });
  }
};

/**
 * @desc    Get hotels by location (city/country)
 * @route   GET /api/hotels/location/:location
 * @access  Public
 */
const getHotelsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const { limit = 20 } = req.query;

    const hotels = await Hotel.findAll({
      where: {
        hotel_status: 'active',
        [Op.or]: [
          { city: { [Op.like]: `%${location}%` } },
          { country: { [Op.like]: `%${location}%` } },
          { micro_location: { [Op.like]: `%${location}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['star_classification', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: `Hotels in ${location} retrieved successfully`,
      data: hotels,
      count: hotels.length
    });
  } catch (error) {
    console.error('Get Hotels By Location Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotels by location',
      error: error.message
    });
  }
};

/**
 * @desc    Get hotels statistics
 * @route   GET /api/hotels/stats/summary
 * @access  Admin
 */
const getHotelStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.count();
    const activeHotels = await Hotel.count({ where: { hotel_status: 'active' } });
    const inactiveHotels = await Hotel.count({ where: { hotel_status: 'inactive' } });
    
    // Count by star classification
    const fiveStarCount = await Hotel.count({ where: { star_classification: '5-star', hotel_status: 'active' } });
    const fourStarCount = await Hotel.count({ where: { star_classification: '4-star', hotel_status: 'active' } });
    const threeStarCount = await Hotel.count({ where: { star_classification: '3-star', hotel_status: 'active' } });
    
    // Count by classification type
    const hotelCount = await Hotel.count({ where: { hotel_classification: 'Hotel', hotel_status: 'active' } });
    const resortCount = await Hotel.count({ where: { hotel_classification: 'Resort', hotel_status: 'active' } });
    const villaCount = await Hotel.count({ where: { hotel_classification: 'Villa', hotel_status: 'active' } });

    res.status(200).json({
      success: true,
      message: 'Hotel statistics retrieved successfully',
      data: {
        total: totalHotels,
        active: activeHotels,
        inactive: inactiveHotels,
        byStarRating: {
          fiveStar: fiveStarCount,
          fourStar: fourStarCount,
          threeStar: threeStarCount
        },
        byType: {
          hotels: hotelCount,
          resorts: resortCount,
          villas: villaCount
        }
      }
    });
  } catch (error) {
    console.error('Get Hotel Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotel statistics',
      error: error.message
    });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  permanentDeleteHotel,
  restoreHotel,
  getHotelsByLocation,
  getHotelStats
};

const Hotel = require('../models/Hotel');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for hotel image uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'hotel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// POST /api/hotels — create a new hotel
const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
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

// GET /api/hotels — list hotels with pagination and filters
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

    // Build dynamic WHERE clause from query params
    const whereClause = {};
    if (city) whereClause.city = { [Op.like]: `%${city}%` };
    if (country) whereClause.country = { [Op.like]: `%${country}%` };
    if (star_classification) whereClause.star_classification = star_classification;
    if (hotel_status) whereClause.hotel_status = hotel_status;
    if (hotel_classification) whereClause.hotel_classification = hotel_classification;
    if (search) {
      whereClause[Op.or] = [
        { hotel_name: { [Op.like]: `%${search}%` } },
        { hotel_description: { [Op.like]: `%${search}%` } },
        { hotel_address: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows: hotels } = await Hotel.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['deleted_at'] }
    });
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

// GET /api/hotels/:id — get single hotel
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

// PUT /api/hotels/:id — update hotel
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Hotel.update() writes ALL keys, bypassing Sequelize dirty-tracking
    const [rowsAffected] = await Hotel.update(updateData, {
      where: { id },
    });

    console.log(`[Update] Hotel ${id}: ${rowsAffected} row(s) affected`);
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

// DELETE /api/hotels/:id — soft delete
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
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

// DELETE /api/hotels/:id/permanent — hard delete
const permanentDeleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByPk(id, { paranoid: false });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
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

// POST /api/hotels/:id/restore — restore soft-deleted hotel
const restoreHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByPk(id, { paranoid: false });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    if (!hotel.deleted_at) {
      return res.status(400).json({ success: false, message: 'Hotel is not deleted' });
    }
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

// GET /api/hotels/location/:location — filter by city or country
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

// GET /api/hotels/stats/summary — hotel statistics
const getHotelStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.count();
    const activeHotels = await Hotel.count({ where: { hotel_status: 'active' } });
    const inactiveHotels = await Hotel.count({ where: { hotel_status: 'inactive' } });
    const fiveStarCount = await Hotel.count({ where: { star_classification: '5-star', hotel_status: 'active' } });
    const fourStarCount = await Hotel.count({ where: { star_classification: '4-star', hotel_status: 'active' } });
    const threeStarCount = await Hotel.count({ where: { star_classification: '3-star', hotel_status: 'active' } });
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

// POST /api/hotels/upload-image — multer file upload
const uploadHotelImage = (req, res) => {
  upload.single('hotel_image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Field name must be "hotel_image".' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { url: imageUrl } });
  });
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
  getHotelStats,
  uploadHotelImage
};

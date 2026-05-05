const { Op } = require('sequelize');
const DriverApplication = require('../models/DriverApplication');
const TransportGig = require('../models/TransportGig');
const TransportBooking = require('../models/TransportBooking');
const User = require('../../user-management/models/User');

/* ─── Vehicle category map ─── */
const VEHICLE_CATEGORIES = {
  'Small Group (1-4)': ['Hatchback', 'Sedan', 'Luxury Car'],
  'Medium Group (5-7)': ['SUV', '4WD', 'MPV/Minivan'],
  'Large Group (8-30+)': ['Passenger Van', 'Mini Coach', 'Tour Bus'],
  Specialized: ['Campervan', 'Open-top Safari', 'Convertible'],
};

/* ═══════════════════════════════════════
   DRIVER APPLICATION ENDPOINTS
   ═══════════════════════════════════════ */

const applyAsDriver = async (req, res) => {
  try {
    const existing = await DriverApplication.findOne({
      where: { user_id: req.user.id, status: { [Op.ne]: 'rejected' } },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === 'pending'
            ? 'You already have a pending application'
            : 'You are already an approved driver',
      });
    }

    // Build file URL paths from multer uploads
    // Use the actual server's hostname and port, not the request's host
    const serverPort = process.env.PORT || 5000;
    const baseUrl = `${req.protocol}://${req.hostname}:${serverPort}`;
    const frontFile = req.files?.licenseFront?.[0];
    const backFile = req.files?.licenseBack?.[0];

    if (!frontFile) {
      return res.status(400).json({ success: false, message: 'Driving license front image is required' });
    }

    const driving_license_front = `${baseUrl}/uploads/licenses/${frontFile.filename}`;
    const driving_license_back = backFile
      ? `${baseUrl}/uploads/licenses/${backFile.filename}`
      : null;

    // Build vehicle_images URLs from uploaded files
    const vehicleFiles = req.files?.vehicleImages || [];
    const vehicle_images = vehicleFiles.map(
      (f) => `${baseUrl}/uploads/vehicles/${f.filename}`
    );

    const application = await DriverApplication.create({
      ...req.body,
      driving_license_front,
      driving_license_back,
      vehicle_images,
      passenger_capacity: parseInt(req.body.passenger_capacity),
      vehicle_year: req.body.vehicle_year ? parseInt(req.body.vehicle_year) : null,
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Driver application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Apply as Driver Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
};

const getMyApplication = async (req, res) => {
  try {
    const application = await DriverApplication.findOne({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('Get My Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application', error: error.message });
  }
};

/* Admin: list all applications */
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await DriverApplication.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    /* attach user info */
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'full_name', 'email', 'profile_picture'],
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const data = rows.map((r) => ({
      ...r.toJSON(),
      applicant: userMap[r.user_id] || null,
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    console.error('Get All Applications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
};

/* Admin: approve / reject */
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const application = await DriverApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await application.update({
      status,
      admin_notes: admin_notes || null,
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
    });

    /* If approved, mark user as driver */
    if (status === 'approved') {
      await User.update({ is_driver: true }, { where: { id: application.user_id } });
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    console.error('Review Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to review application', error: error.message });
  }
};

/* ═══════════════════════════════════════
   TRANSPORT GIG ENDPOINTS
   ═══════════════════════════════════════ */

const createGig = async (req, res) => {
  try {
    const imageFiles = req.files?.gigImages || [];
    const serverPort = process.env.PORT || 5000;
    const baseUrl = `${req.protocol}://${req.hostname}:${serverPort}`;
    const images = imageFiles.map((f) => `${baseUrl}/uploads/vehicles/${f.filename}`);

    const gig = await TransportGig.create({
      ...req.body,
      images: images.length > 0 ? images : undefined,
      driver_id: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Gig created successfully', data: gig });
  } catch (error) {
    console.error('Create Gig Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create gig', error: error.message });
  }
};

const updateGig = async (req, res) => {
  try {
    const gig = await TransportGig.findOne({
      where: { id: req.params.id, driver_id: req.user.id },
    });

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const imageFiles = req.files?.gigImages || [];
    const serverPort = process.env.PORT || 5000;
    const baseUrl = `${req.protocol}://${req.hostname}:${serverPort}`;
    const newImages = imageFiles.map((f) => `${baseUrl}/uploads/vehicles/${f.filename}`);

    const updateData = { ...req.body };
    if (newImages.length > 0) {
      // Merge new uploads with any existing images in the body (or replace if body.images is set)
      updateData.images = newImages;
    }

    await gig.update(updateData);
    res.status(200).json({ success: true, message: 'Gig updated successfully', data: gig });
  } catch (error) {
    console.error('Update Gig Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update gig', error: error.message });
  }
};

const deleteGig = async (req, res) => {
  try {
    const gig = await TransportGig.findOne({
      where: { id: req.params.id, driver_id: req.user.id },
    });

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    await gig.destroy();
    res.status(200).json({ success: true, message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('Delete Gig Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete gig', error: error.message });
  }
};

const getMyGigs = async (req, res) => {
  try {
    const gigs = await TransportGig.findAll({
      where: { driver_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({ success: true, data: gigs });
  } catch (error) {
    console.error('Get My Gigs Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gigs', error: error.message });
  }
};

/* Public: get all active gigs with search/filter */
const getAllGigs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      start_location,
      end_location,
      vehicle_category,
      vehicle_type,
      min_capacity,
      max_price,
      date,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const where = { status: 'active' };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { start_location: { [Op.like]: `%${search}%` } },
        { end_location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (start_location) {
      where.start_location = { [Op.like]: `%${start_location}%` };
    }

    if (end_location) {
      where.end_location = { [Op.like]: `%${end_location}%` };
    }

    if (vehicle_category) {
      where.vehicle_category = vehicle_category;
    }

    if (vehicle_type) {
      where.vehicle_type = vehicle_type;
    }

    if (min_capacity) {
      where.passenger_capacity = { [Op.gte]: parseInt(min_capacity) };
    }

    if (max_price) {
      where.price_per_day = { [Op.lte]: parseFloat(max_price) };
    }

    if (date) {
      where.available_from = { [Op.lte]: date };
      where.available_to = { [Op.gte]: date };
    }

    const offset = (page - 1) * limit;
    const { count, rows: gigs } = await TransportGig.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['deleted_at'] },
    });

    /* attach driver info */
    const driverIds = [...new Set(gigs.map((g) => g.driver_id))];
    const drivers = await User.findAll({
      where: { id: driverIds },
      attributes: ['id', 'full_name', 'profile_picture'],
    });
    const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d]));

    const data = gigs.map((g) => ({
      ...g.toJSON(),
      driver: driverMap[g.driver_id] || null,
    }));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data,
      vehicleCategories: VEHICLE_CATEGORIES,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get All Gigs Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gigs', error: error.message });
  }
};

const getGigById = async (req, res) => {
  try {
    const gig = await TransportGig.findByPk(req.params.id, {
      attributes: { exclude: ['deleted_at'] },
    });

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const driver = await User.findByPk(gig.driver_id, {
      attributes: ['id', 'full_name', 'profile_picture', 'email'],
    });

    res.status(200).json({
      success: true,
      data: { ...gig.toJSON(), driver },
    });
  } catch (error) {
    console.error('Get Gig By ID Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gig', error: error.message });
  }
};

/* ═══════════════════════════════════════
   BOOKING ENDPOINTS
   ═══════════════════════════════════════ */

const createBooking = async (req, res) => {
  try {
    const gig = await TransportGig.findByPk(req.body.gig_id);
    if (!gig || gig.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Gig is not available' });
    }

    if (gig.driver_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own gig' });
    }

    /* Calculate total price */
    const start = new Date(req.body.start_date);
    const end = new Date(req.body.end_date);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const total_price = (parseFloat(gig.price_per_day) * days).toFixed(2);

    const booking = await TransportBooking.create({
      gig_id: gig.id,
      client_id: req.user.id,
      driver_id: gig.driver_id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      passenger_count: req.body.passenger_count,
      pickup_location: req.body.pickup_location,
      dropoff_location: req.body.dropoff_location,
      total_price,
      currency: gig.currency,
      notes: req.body.notes || null,
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

/* Client: my bookings */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await TransportBooking.findAll({
      where: { client_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    /* enrich with gig + driver info */
    const gigIds = [...new Set(bookings.map((b) => b.gig_id))];
    const gigs = await TransportGig.findAll({ where: { id: gigIds }, paranoid: false });
    const gigMap = Object.fromEntries(gigs.map((g) => [g.id, g]));

    const driverIds = [...new Set(bookings.map((b) => b.driver_id))];
    const drivers = await User.findAll({
      where: { id: driverIds },
      attributes: ['id', 'full_name', 'profile_picture'],
    });
    const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d]));

    const data = bookings.map((b) => ({
      ...b.toJSON(),
      gig: gigMap[b.gig_id] || null,
      driver: driverMap[b.driver_id] || null,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

/* Driver: bookings for my gigs */
const getDriverBookings = async (req, res) => {
  try {
    const bookings = await TransportBooking.findAll({
      where: { driver_id: req.user.id },
      order: [['start_date', 'ASC']],
    });

    const gigIds = [...new Set(bookings.map((b) => b.gig_id))];
    const gigs = await TransportGig.findAll({ where: { id: gigIds }, paranoid: false });
    const gigMap = Object.fromEntries(gigs.map((g) => [g.id, g]));

    const clientIds = [...new Set(bookings.map((b) => b.client_id))];
    const clients = await User.findAll({
      where: { id: clientIds },
      attributes: ['id', 'full_name', 'email', 'profile_picture'],
    });
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

    const data = bookings.map((b) => ({
      ...b.toJSON(),
      gig: gigMap[b.gig_id] || null,
      client: clientMap[b.client_id] || null,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get Driver Bookings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

/* Driver: update booking status (confirm/complete/cancel) */
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await TransportBooking.findOne({
      where: { id, driver_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.update({ status });
    res.status(200).json({ success: true, message: `Booking ${status}`, data: booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
};

/* Client: cancel my booking */
const cancelBooking = async (req, res) => {
  try {
    const booking = await TransportBooking.findOne({
      where: { id: req.params.id, client_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking' });
    }

    await booking.update({ status: 'cancelled' });
    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
};

/* Client: edit my booking (resets status to pending) */
const updateBooking = async (req, res) => {
  try {
    const booking = await TransportBooking.findOne({
      where: { id: req.params.id, client_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot edit a cancelled or completed booking' });
    }

    const gig = await TransportGig.findByPk(booking.gig_id, { paranoid: false });
    if (!gig) {
      return res.status(404).json({ success: false, message: 'The transport gig for this booking no longer exists' });
    }
    const start = new Date(req.body.start_date);
    const end = new Date(req.body.end_date);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const total_price = (parseFloat(gig.price_per_day) * days).toFixed(2);

    await booking.update({
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      passenger_count: req.body.passenger_count,
      pickup_location: req.body.pickup_location,
      dropoff_location: req.body.dropoff_location,
      notes: req.body.notes || null,
      total_price,
      status: 'pending',
    });

    res.status(200).json({ success: true, message: 'Booking updated, awaiting driver confirmation', data: booking });
  } catch (error) {
    console.error('Update Booking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
};

/* Driver dashboard stats */
const getDriverStats = async (req, res) => {
  try {
    const driverId = req.user.id;

    const totalGigs = await TransportGig.count({ where: { driver_id: driverId } });
    const activeGigs = await TransportGig.count({ where: { driver_id: driverId, status: 'active' } });

    const totalBookings = await TransportBooking.count({ where: { driver_id: driverId } });
    const confirmedBookings = await TransportBooking.count({ where: { driver_id: driverId, status: 'confirmed' } });
    const completedBookings = await TransportBooking.count({ where: { driver_id: driverId, status: 'completed' } });
    const pendingBookings = await TransportBooking.count({ where: { driver_id: driverId, status: 'pending' } });

    const bookings = await TransportBooking.findAll({
      where: { driver_id: driverId, status: { [Op.in]: ['confirmed', 'completed'] } },
      attributes: ['total_price'],
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    /* Monthly revenue for chart (last 6 months) */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentBookings = await TransportBooking.findAll({
      where: {
        driver_id: driverId,
        status: { [Op.in]: ['confirmed', 'completed'] },
        created_at: { [Op.gte]: sixMonthsAgo },
      },
      attributes: ['total_price', 'created_at'],
      order: [['created_at', 'ASC']],
    });

    const monthlyRevenue = {};
    recentBookings.forEach((b) => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + parseFloat(b.total_price || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        totalGigs,
        activeGigs,
        totalBookings,
        confirmedBookings,
        completedBookings,
        pendingBookings,
        totalRevenue,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Get Driver Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

/* Admin: transport stats */
const getAdminTransportStats = async (req, res) => {
  try {
    const totalApplications = await DriverApplication.count();
    const pendingApplications = await DriverApplication.count({ where: { status: 'pending' } });
    const approvedDrivers = await DriverApplication.count({ where: { status: 'approved' } });
    const totalGigs = await TransportGig.count();
    const totalBookings = await TransportBooking.count();

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        pendingApplications,
        approvedDrivers,
        totalGigs,
        totalBookings,
      },
    });
  } catch (error) {
    console.error('Admin Transport Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

module.exports = {
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
};

const { Op } = require('sequelize');
const Lifestyle = require('../models/Lifestyle');
const Destination = require('../models/Destination');

/* ── GET /api/lifestyles ────────────────────────────── */
const getAllLifestyles = async (req, res) => {
  try {
    const { search = '', destination_id, city, active_only, page = 1, limit = 50 } = req.query;

    const where = { deleted_at: null };

    if (search) {
      where[Op.or] = [
        { lifestyle_name:        { [Op.like]: `%${search}%` } },
        { lifestyle_description: { [Op.like]: `%${search}%` } },
        { lifestyle_city:        { [Op.like]: `%${search}%` } },
        { selling_points:        { [Op.like]: `%${search}%` } },
      ];
    }

    /* Filter by destination id — look up city_key from destinations table */
    if (destination_id) {
      const dest = await Destination.findByPk(destination_id);
      if (dest && dest.city_key) {
        where.lifestyle_city = dest.city_key;
      }
    }

    /* Direct city filter */
    if (city) {
      where.lifestyle_city = city;
    }

    /* Only show active (active_status = 1) unless explicitly disabled */
    if (active_only !== 'false') {
      where.active_status = 1;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Lifestyle.findAndCountAll({
      where,
      order: [['lifestyle_id', 'ASC']],
      offset,
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch lifestyle activities', error: error.message });
  }
};

/* ── GET /api/lifestyles/:id ────────────────────────── */
const getLifestyleById = async (req, res) => {
  try {
    const item = await Lifestyle.findOne({ where: { lifestyle_id: req.params.id, deleted_at: null } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lifestyle activity not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ── POST /api/lifestyles ───────────────────────────── */
const createLifestyle = async (req, res) => {
  try {
    const {
      lifestyle_name, lifestyle_description, sub_description, lifestyle_city,
      lifestyle_attraction_type, latitude, longitude, address, image,
      active_status, selling_points, adult_rate, child_rate, currency,
    } = req.body;

    if (!lifestyle_name || !lifestyle_name.trim()) {
      return res.status(400).json({ success: false, message: 'Activity name is required' });
    }

    const item = await Lifestyle.create({
      lifestyle_name, lifestyle_description, sub_description, lifestyle_city,
      lifestyle_attraction_type, latitude, longitude, address, image,
      active_status: active_status !== undefined ? active_status : 1,
      selling_points, adult_rate, child_rate, currency,
    });
    return res.status(201).json({ success: true, data: item, message: 'Lifestyle activity created successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ── PUT /api/lifestyles/:id ────────────────────────── */
const updateLifestyle = async (req, res) => {
  try {
    const item = await Lifestyle.findOne({ where: { lifestyle_id: req.params.id, deleted_at: null } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lifestyle activity not found' });
    }
    const {
      lifestyle_name, lifestyle_description, sub_description, lifestyle_city,
      lifestyle_attraction_type, latitude, longitude, address, image,
      active_status, selling_points, adult_rate, child_rate, currency,
    } = req.body;

    await item.update({
      lifestyle_name, lifestyle_description, sub_description, lifestyle_city,
      lifestyle_attraction_type, latitude, longitude, address, image,
      active_status, selling_points, adult_rate, child_rate, currency,
    });
    return res.status(200).json({ success: true, data: item, message: 'Lifestyle activity updated successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ── DELETE /api/lifestyles/:id ─────────────────────── */
const deleteLifestyle = async (req, res) => {
  try {
    const item = await Lifestyle.findOne({ where: { lifestyle_id: req.params.id, deleted_at: null } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lifestyle activity not found' });
    }
    /* Soft delete — set deleted_at */
    await item.update({ deleted_at: new Date() });
    return res.status(200).json({ success: true, message: 'Lifestyle activity deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLifestyles,
  getLifestyleById,
  createLifestyle,
  updateLifestyle,
  deleteLifestyle,
};

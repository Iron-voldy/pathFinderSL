const { Op } = require('sequelize');
const Destination = require('../models/Destination');
const Lifestyle = require('../models/Lifestyle');

/* ── GET /api/destinations ─────────────────────────── */
const getAllDestinations = async (req, res) => {
  try {
    const { search = '', is_active, region, page = 1, limit = 50 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { region: { [Op.like]: `%${search}%` } },
        { tagline: { [Op.like]: `%${search}%` } },
      ];
    }
    if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true';
    if (region) where.region = { [Op.like]: `%${region}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Destination.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    /* attach lifestyle count to each destination */
    const data = await Promise.all(
      rows.map(async (dest) => {
        const activityCount = dest.city_key
          ? await Lifestyle.count({ where: { lifestyle_city: dest.city_key, deleted_at: null, active_status: 1 } })
          : 0;
        return { ...dest.toJSON(), activityCount };
      })
    );

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch destinations', error: error.message });
  }
};

/* ── GET /api/destinations/:id ─────────────────────── */
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    const activityCount = destination.city_key
      ? await Lifestyle.count({ where: { lifestyle_city: destination.city_key, deleted_at: null, active_status: 1 } })
      : 0;
    return res.status(200).json({ success: true, data: { ...destination.toJSON(), activityCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ── POST /api/destinations ─────────────────────────── */
const createDestination = async (req, res) => {
  try {
    const { name, tagline, description, image_url, region, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Destination name is required' });
    }
    const destination = await Destination.create({ name, tagline, description, image_url, region, is_active });
    return res.status(201).json({ success: true, data: destination, message: 'Destination created successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ── PUT /api/destinations/:id ─────────────────────── */
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    const { name, tagline, description, image_url, region, is_active } = req.body;
    await destination.update({ name, tagline, description, image_url, region, is_active });
    return res.status(200).json({ success: true, data: destination, message: 'Destination updated successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ── DELETE /api/destinations/:id ──────────────────── */
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    await destination.destroy();
    return res.status(200).json({ success: true, message: 'Destination deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};

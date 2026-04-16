const { createDestination, getAllDestinations, addDestinationImage } = require('../models/Destination');

async function createDestinationHandler(req, res) {
  try {
    const { name, district, category, description } = req.body;
    const file = req.file;

    if (!name || !district || !category || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const destination = await createDestination({
      name,
      district: district || '',
      category: category || '',
      description: description || '',
    });

    // If an image was uploaded, add it to DESTINATION_IMAGE
    if (file) {
      const imageUrl = `/uploads/${file.filename}`;
      await addDestinationImage(destination.id, imageUrl);
    }

    res.status(201).json(destination);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create destination' });
  }
}

async function listDestinationsHandler(_req, res) {
  try {
    const destinations = await getAllDestinations();
    res.json(destinations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load destinations' });
  }
}

module.exports = {
  createDestinationHandler,
  listDestinationsHandler,
};

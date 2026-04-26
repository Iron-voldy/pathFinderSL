const express = require('express');
const upload = require('../../config/upload');
const {
  createDestinationHandler,
  listDestinationsHandler,
  updateDestinationHandler,
  deleteDestinationHandler,
} = require('../controllers/destinationController');

const router = express.Router();

router.get('/', listDestinationsHandler);
router.post('/', upload.single('image'), createDestinationHandler);
router.put('/:id', updateDestinationHandler);
router.delete('/:id', deleteDestinationHandler);

module.exports = router;

const express = require('express');
const upload = require('../../config/upload');
const {
  createDestinationHandler,
  listDestinationsHandler,
} = require('../controllers/destinationController');

const router = express.Router();

router.get('/', listDestinationsHandler);
router.post('/', upload.single('image'), createDestinationHandler);

module.exports = router;

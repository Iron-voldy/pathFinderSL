const express = require('express');
const {
  postPlannerMessage,
  getAiPlannerHealth,
} = require('../controllers/aiTripPlannerController');

const router = express.Router();

router.get('/health', getAiPlannerHealth);
router.post('/message', postPlannerMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journey.controller');
const validateJourneyRequest = require('../middleware/validateJourneyRequest');

/**
 * @route   GET /api/journeys
 * @desc    Get journey information between two stations
 * @access  Public
 * @params  from - Origin station ID
 * @params  to - Destination station ID
 * @params  departure - ISO 8601 date string (e.g., 2025-06-28T10:00:00)
 */
router.get('/', validateJourneyRequest, journeyController.getJourneys);

module.exports = router;

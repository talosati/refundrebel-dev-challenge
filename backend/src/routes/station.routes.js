const express = require('express');
const router = express.Router();
const stationController = require('../controllers/station.controller');

/**
 * @route   GET /api/stations
 * @desc    Get all available stations
 * @access  Public
 * @returns {Array} List of station objects with id, name, and address
 */
router.get('/', stationController.getAllStations);

module.exports = router;

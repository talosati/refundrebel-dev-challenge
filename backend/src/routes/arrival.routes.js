const express = require('express');
const router = express.Router();
const arrivalController = require('../controllers/arrival.controller');

router.get('/station/:stationId', arrivalController.getArrivalsByStationId);

module.exports = router;

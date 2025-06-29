const express = require('express');
const router = express.Router();
const arrivalController = require('../controllers/arrivalAndDeparture.controller');

router.get('/arrivalsAndDepartures/station/:stationId', arrivalController.getArrivalsAndDeparturesByStationId);

module.exports = router;

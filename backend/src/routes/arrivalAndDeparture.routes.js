const express = require('express');
const router = express.Router();
const arrivalController = require('../controllers/arrivalAndDeparture.controller');

/**
 * @swagger
 * tags:
 *   name: Arrivals & Departures
 *   description: API for managing train arrivals and departures
 */

/**
 * @swagger
 * /api/arrivalsAndDepartures/station/{stationId}:
 *   get:
 *     summary: Get arrivals and departures for a specific station
 *     tags: [Arrivals & Departures]
 *     parameters:
 *       - in: path
 *         name: stationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the station
 *     responses:
 *       200:
 *         description: Successful response with arrivals and departures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     arrivals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ArrivalDeparture'
 *                     departures:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ArrivalDeparture'
 *       400:
 *         description: Invalid station ID or parameters
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.get('/arrivalsAndDepartures/station/:stationId', arrivalController.getArrivalsAndDeparturesByStationId);

module.exports = router;

const express = require('express');
const router = express.Router();
const stationController = require('../controllers/station.controller');

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: API for managing train stations
 */

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all available stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: Successful response with list of stations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error
 */
router.get('/', stationController.getAllStations);

module.exports = router;

const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journey.controller');
const validateJourneyRequest = require('../middleware/validateJourneyRequest');

/**
 * @swagger
 * tags:
 *   name: Journeys
 *   description: API for managing train journeys
 */

/**
 * @swagger
 * /api/journeys:
 *   get:
 *     summary: Get journey information between two stations
 *     tags: [Journeys]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin station ID
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         required: true
 *         description: Destination station ID
 *     responses:
 *       200:
 *         description: Successful response with journey information
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
 *                     $ref: '#/components/schemas/Journey'
 *       400:
 *         description: Invalid input parameters
 *       500:
 *         description: Server error
 */
router.get('/', validateJourneyRequest, journeyController.getJourneys);

module.exports = router;

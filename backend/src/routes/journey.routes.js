const express = require('express');
const axios = require('axios');
const router = express.Router();

const DB_VENDO_BASE_URL = process.env.DB_VENDO_BASE_URL || 'http://localhost:3001';

/**
 * @route   GET /api/journeys
 * @desc    Get journey information between two stations
 * @access  Public
 * @params  from - Origin station ID
 * @params  to - Destination station ID
 * @params  departure - ISO 8601 date string (e.g., 2025-06-28T10:00:00)
 */
router.get('/', async (req, res) => {
  try {
    const { from, to, departure } = req.query;
    
    if (!from || !to || !departure) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: from, to, and departure are required'
      });
    }

    const response = await axios.get(`${DB_VENDO_BASE_URL}/journeys`, {
      params: {
        from,
        to,
        departure
      },
      headers: {
        'Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
        'Accept': 'application/json',
      }
    });

    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching journey data:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data?.message || 'Error from DB Vendo API',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'No response from DB Vendo service',
        details: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Error setting up request to DB Vendo',
        details: error.message
      });
    }
  }
});

module.exports = router;

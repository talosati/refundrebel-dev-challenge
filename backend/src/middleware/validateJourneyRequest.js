/**
 * Middleware to validate journey request parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateJourneyRequest = (req, res, next) => {
    const { from, to, departure } = req.query;
    
    if (!from || !to || !departure) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameters: from, to, and departure are required'
        });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
    if (!dateRegex.test(departure)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid departure format. Please use ISO 8601 format (e.g., 2025-06-28T10:00:00 or 2025-06-28T10:00:00.000Z)'
        });
    }
    
    if (isNaN(new Date(departure).getTime())) {
        return res.status(400).json({
            success: false,
            error: 'Invalid date provided'
        });
    }

    if (typeof from !== 'string' || from.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Invalid from station ID'
        });
    }

    if (typeof to !== 'string' || to.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Invalid to station ID'
        });
    }

    next();
};

module.exports = validateJourneyRequest;

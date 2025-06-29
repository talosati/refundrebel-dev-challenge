/**
 * Middleware to validate journey request parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateJourneyRequest = (req, res, next) => {
    const { from, to } = req.query;
    
    if (!from || !to) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameters: from and to are required'
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

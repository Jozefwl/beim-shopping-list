const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Extract the token

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { 
                id: decoded.userId, 
                role: decoded.role // Ensure the token includes the user's role
            };
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
        }
    }

    // Proceed with the next middleware or route handler
    next();
};

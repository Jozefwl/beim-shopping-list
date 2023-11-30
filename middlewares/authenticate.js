const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Extract the token

 try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { 
            id: decoded.userId, 
            role: decoded.role // Ensure the token includes the user's role
        };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
    }
};

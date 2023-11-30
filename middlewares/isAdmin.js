module.exports = function isAdmin(req, res, next) {
    try {
        // Check if the user exists and has the role 'admin'
        if (req.user && req.user.role === 'admin') {
            next(); // User is an admin, proceed
        } else {
            res.status(403).json({ message: 'Access denied' }); // User is not an admin, deny access
        }
    }
    catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

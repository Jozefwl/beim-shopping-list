module.exports = function isAdmin(req, res, next) {
    if (req.user && req.user.id === 'admin') {
        next(); // User ID is 'admin', proceed
    } else {
        res.status(403).send('Access denied'); // User is not an admin, deny access
    }
};

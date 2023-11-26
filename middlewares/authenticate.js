module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided');
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract the token from the header
        const token = authHeader.substring(7); // 'Bearer ' is 7 characters

        if (token) {
            req.user = { id: token }; // Set the user ID to the token value
            next();
        } else 
        {
            res.status(401).send('Unauthorized´: Unknown Error');
        }
    };
}
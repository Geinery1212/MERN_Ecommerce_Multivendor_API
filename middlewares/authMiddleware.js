const jwt = require('jsonwebtoken');
module.exports.authMiddleware = async (req, res, next) => {    
    const { accessToken } = req.cookies;

    if (!accessToken) {
        return res.status(409).json({ error: 'Please Login First' });
    }

    try {
        const decodedToken = await jwt.verify(accessToken, process.env.SECRET_JWT);
        req.role = decodedToken.role;
        req.id = decodedToken.id;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(409).json({ error: 'Please Login' });
    }
};
const jwt = require('jsonwebtoken');
module.exports.authMiddleware = async (req, res) => {
    const { accessToken } = req.cookies;
    if (!accessToken) {
        return res.status(409).json({ error: 'Please Login First' });
    } else {
        try {
            const deCodeToken = await jwt.verify(accessToken, process.env.SECRET_JWT);
            req.role = deCodeToken.role;
            req.id = deCodeToken.id;
            next();
        } catch (error) {
            return res.status(409).json({ error: 'Please Login' });
        }
    }
}
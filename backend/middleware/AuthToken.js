const jwt = require('jsonwebtoken');

const authToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers['authorization'];
    if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({
        message: "Please log in to proceed.",
        error: true,
        success: false
      });
    }

    jwt.verify(token, process.env.TOKEN_SECRET_KEY || 'default_secret_key_orange_garments', (error, decoded) => {
      if (error) {
        return res.status(403).json({
          message: "Session expired or invalid. Please log in again.",
          error: true,
          success: false
        });
      }

      req.userId = decoded?._id;
      req.userRole = decoded?.role;
      next();
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
};

module.exports = authToken;

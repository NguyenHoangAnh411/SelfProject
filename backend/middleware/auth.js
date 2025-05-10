const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Authenticating request:', {
    path: req.path,
    method: req.method,
    headers: req.headers
  });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ 
      message: 'Authentication required',
      details: 'No token provided'
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = user.userId || user.id;
    console.log('Token verified for user:', userId);
    req.user = { ...user, id: userId };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ 
      message: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { authenticateToken }; 
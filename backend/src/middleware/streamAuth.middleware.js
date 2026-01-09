import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const streamAuth = async (req, res, next) => {
  try {
    const token = req.query.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    req.tenantId = user.tenantId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default streamAuth;

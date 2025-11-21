/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches the user ID to the request object.
 */

import jwt from 'jsonwebtoken';

/**
 * Express middleware to protect routes with JWT authentication.
 * Expects an Authorization header: "Bearer <token>".
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user ID to request for downstream handlers
      req.user = { id: decoded.id };
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};
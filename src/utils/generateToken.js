// Creates a signed JWT containing the user's id and role. Any route
// protected by our auth middleware will decode this token to know
// who's making the request and what they're allowed to do.

import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
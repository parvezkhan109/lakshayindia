const jwt = require('jsonwebtoken');

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  const expiresIn = process.env.JWT_EXPIRES_IN || '12h';

  return jwt.sign(
    { sub: String(user.id), role: user.role, username: user.username },
    secret,
    { expiresIn }
  );
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };

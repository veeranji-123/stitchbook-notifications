const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtSecret, internalToken } = require('./config');

const ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

function requireUser(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.auth = { id: decoded.id, email: decoded.email, type: decoded.type };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireInternal(req, res, next) {
  const provided = req.headers['x-internal-token'];
  if (typeof provided !== 'string') return res.status(401).json({ error: 'Unauthorized' });
  const expectedBuf = Buffer.from(internalToken);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

function verifySocketToken(token) {
  const decoded = jwt.verify(token, jwtSecret);
  return { id: decoded.id, email: decoded.email, type: decoded.type };
}

function validId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

module.exports = { requireUser, requireInternal, verifySocketToken, validId };

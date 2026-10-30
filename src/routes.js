const express = require('express');
const { pool } = require('./db');
const { requireUser, requireInternal, validId } = require('./auth');
const { createNotification } = require('./createNotification');

const router = express.Router();

function attachIo(io) {
  router.post('/internal/notifications', requireInternal, async (req, res) => {
    try {
      const { userId, title, body, bookingId } = req.body;
      if (!validId(userId)) return res.status(400).json({ error: 'Invalid user id' });
      if (typeof title !== 'string' || title.trim().length === 0 || title.length > 200) {
        return res.status(400).json({ error: 'Invalid title' });
      }
      if (typeof body !== 'string' || body.trim().length === 0 || body.length > 2000) {
        return res.status(400).json({ error: 'Invalid body' });
      }
      if (bookingId && !validId(bookingId)) return res.status(400).json({ error: 'Invalid booking id' });
      const notification = await createNotification({
        userId,
        title: title.trim(),
        body: body.trim(),
        bookingId: bookingId || '',
      });
      if (notification) io.to(`user:${userId}`).emit('notification', notification);
      return res.json({ notification });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  router.post('/internal/realtime', requireInternal, (req, res) => {
    const { userId, event, payload } = req.body || {};
    if (!validId(userId)) return res.status(400).json({ error: 'Invalid user id' });
    if (event !== 'message') return res.status(400).json({ error: 'Unsupported event' });
    io.to(`user:${userId}`).emit(event, payload);
    return res.json({ success: true });
  });
}

router.get('/api/notifications/:userId', requireUser, async (req, res) => {
  try {
    if (!validId(req.params.userId)) return res.status(400).json({ error: 'Invalid user id' });
    if (req.auth.id !== req.params.userId) {
      return res.status(403).json({ error: 'Cannot view another user\'s notifications' });
    }
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    return res.json({ notifications: result.rows });
  } catch (e) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/push/register', requireUser, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || token.length > 4096) {
      return res.status(400).json({ error: 'FCM token required' });
    }
    await pool.query(
      'INSERT INTO push_tokens (user_id, token) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.auth.id, token]
    );
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to register token' });
  }
});

module.exports = { router, attachIo };

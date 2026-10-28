const crypto = require('crypto');
const { pool } = require('./db');

async function wasRecentlySent(userId, title, bookingId) {
  if (!bookingId) return false;
  const result = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND booking_id = $2 AND title = $3
       AND CASE
         WHEN created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}:[0-9]{2}'
         THEN created_at::timestamptz
       END > NOW() - INTERVAL '30 seconds'
     LIMIT 1`,
    [userId, bookingId, title]
  );
  return result.rows.length > 0;
}

async function createNotification({ userId, title, body, bookingId }) {
  if (await wasRecentlySent(userId, title, bookingId || '')) {
    return null;
  }
  const notification = {
    id: crypto.randomUUID(),
    user_id: userId,
    title,
    body,
    booking_id: bookingId || '',
    is_read: 0,
    created_at: new Date().toISOString(),
  };
  await pool.query(
    'INSERT INTO notifications (id, user_id, title, body, booking_id, is_read, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [notification.id, notification.user_id, notification.title, notification.body, notification.booking_id, notification.is_read, notification.created_at]
  );
  return notification;
}

module.exports = { createNotification };

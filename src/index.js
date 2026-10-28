const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { port, corsOrigin } = require('./config');
const { initDb } = require('./db');
const { verifySocketToken } = require('./auth');
const { router, attachIo } = require('./routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: corsOrigin } });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    socket.data.auth = verifySocketToken(token);
    return next();
  } catch (e) {
    return next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  const auth = socket.data.auth;
  if (!auth) {
    socket.disconnect(true);
    return;
  }
  socket.join(`user:${auth.id}`);
  socket.on('join', (requestedUserId) => {
    if (requestedUserId && requestedUserId === auth.id) socket.join(`user:${auth.id}`);
  });
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
attachIo(io);
app.get('/', (req, res) => {
  res.json({ service: 'stitchbook-notifications', status: 'ok' });
});
app.use(router);

initDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`stitchbook-notifications listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('[fatal] Database setup failed:', error.message);
    process.exit(1);
  });

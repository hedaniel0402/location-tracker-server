
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json());

const lastLocations = {};

app.post('/api/updateLocation', (req, res) => {
  const { userId, lat, lon, timestamp, accuracy } = req.body;
  if (!userId || !lat || !lon) return res.status(400).json({ error: 'missing fields' });
  const payload = { userId, lat, lon, timestamp, accuracy };
  lastLocations[userId] = payload;
  io.to(userId).emit('locationUpdate', payload);
  res.json({ ok: true });
});

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', userId => {
    socket.join(userId);
    if (lastLocations[userId]) socket.emit('locationUpdate', lastLocations[userId]);
  });

  socket.on('unsubscribe', userId => socket.leave(userId));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));

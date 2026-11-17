require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { Server } = require('socket.io');
const Listing = require('./models/Listing');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

app.set('io', io);
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Every minute: mark unclaimed listings past their pickup time as expired
cron.schedule('* * * * *', async () => {
  const result = await Listing.updateMany(
    { status: 'available', pickupBefore: { $lte: new Date() } },
    { status: 'expired' }
  );
  if (result.modifiedCount > 0) io.emit('listing:expired');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`));
  })
  .catch((err) => console.error('DB connection failed:', err.message));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017/task-3';
const PORT = 5000;

// EXPRESS SETUP
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// MONGODB SETUP
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define a Document schema and model
const DocumentSchema = new mongoose.Schema({
  content: { type: String, default: '' }
});
const Document = mongoose.model('Document', DocumentSchema);

// === SOCKET.IO HANDLING ===
io.on('connection', async (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Load document from MongoDB or create it
  let doc = await Document.findOne();
  if (!doc) {
    doc = new Document();
    await doc.save();
  }

  // Send existing content to client
  socket.emit('load-document', doc.content);

  // Listen to changes from client
  socket.on('send-changes', async (newText) => {
    doc.content = newText;
    await doc.save(); // Save updated content to DB
    socket.broadcast.emit('receive-changes', newText); // Notify other users
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// START SERVER
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

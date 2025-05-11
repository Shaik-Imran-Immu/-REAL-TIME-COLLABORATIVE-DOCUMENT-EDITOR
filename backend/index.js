// Basic setup imports
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Document = require('./models/Document');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS to allow frontend access
const io = new Server(server, {
  cors: {
    origin: "*" // Allow all origins in dev. Use specific origin in production.
  }
});

// Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb://localhost:27017/collab-docs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Allow cross-origin requests and JSON body parsing
app.use(cors());
app.use(express.json());

// Handle WebSocket connections
io.on('connection', socket => {
  console.log('🔌 New client connected:', socket.id);

  // When a client requests a document by ID
  socket.on('get-document', async docId => {
    // Try to find the document in DB
    let document = await Document.findById(docId);

    // If not found, create a new empty doc
    if (!document) {
      document = await Document.create({ _id: docId, data: "" });
    }

    // Join the client to a "room" based on doc ID
    socket.join(docId);

    // Send the document content to the client
    socket.emit('load-document', document.data);

    // Listen for changes and broadcast to everyone else editing this doc
    socket.on('send-changes', delta => {
      socket.broadcast.to(docId).emit('receive-changes', delta);
    });

    // Save document to DB periodically
    socket.on('save-document', async data => {
      await Document.findByIdAndUpdate(docId, { data });
    });
  });
});

// Start the server
server.listen(3001, () => {
  console.log('🟢 Backend running at http://localhost:3001');
});

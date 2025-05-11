const mongoose = require('mongoose');

// Simple Mongo schema: _id = document ID, data = Quill editor content
const Document = new mongoose.Schema({
  _id: String,
  data: String,
});

module.exports = mongoose.model('Document', Document);

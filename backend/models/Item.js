const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  ItemName: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Type: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },
  Location: {
    type: String,
    required: true
  },
  Date: {
    type: Date,
    required: true
  },
  ContactInfo: {
    type: String,
    required: true
  },
  ReportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Item', itemSchema);

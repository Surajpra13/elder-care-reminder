const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true // e.g. "Son - Rahul", "Family Doctor"
  },
  relation: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true // e.g. "+919876543210"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Emergency', emergencySchema);
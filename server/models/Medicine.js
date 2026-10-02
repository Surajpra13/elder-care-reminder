const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true // e.g. "1 Tablet", "5ml"
  },
  time: {
    type: String,
    required: true // e.g. "08:00 AM"
  },
  taken: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medicine', medicineSchema);
const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);
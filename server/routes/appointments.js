const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// 1. Get all appointments for logged in user only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: 'User ID missing in token' });
    }

    const items = await Appointment.find({
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    }).sort({ date: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add appointment
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: 'User ID missing in token' });
    }

    const { doctorName, hospital, date, time } = req.body;
    const newAppointment = new Appointment({
      user: currentUserId,
      userId: currentUserId,
      doctorName,
      hospital,
      date,
      time
    });

    const saved = await newAppointment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete appointment (only logged in user can delete their own appointment)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    const deleted = await Appointment.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Appointment not found or unauthorized' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
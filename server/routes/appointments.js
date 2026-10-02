const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

// 1. Get all appointments for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Appointment.find({ user: req.user.id }).sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add appointment
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { doctorName, hospital, date, time } = req.body;
    const newAppointment = new Appointment({
      user: req.user.id,
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

// 3. Delete appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
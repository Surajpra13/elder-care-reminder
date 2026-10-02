const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Medicine = require('../models/Medicine');

const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_super_secret_key_123';

// Middleware token verify karne ke liye
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

// 1. Get all medicines for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add new medicine
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, dosage, time } = req.body;
    const newMed = new Medicine({
      user: req.user.id,
      name,
      dosage,
      time
    });
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete medicine
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
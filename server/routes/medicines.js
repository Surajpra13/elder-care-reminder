const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Medicine = require('../models/Medicine');

const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_super_secret_key_123';

// Middleware token verify karne ke liye
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'No token, unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// 1. Get all medicines for logged in user strictly
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.user.id || req.user._id || req.user.userId;

    if (!rawUserId) {
      return res.status(400).json({ message: 'User ID missing in token payload' });
    }

    const currentUserId = rawUserId.toString();

    const medicines = await Medicine.find({
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add new medicine
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, dosage, time, stock } = req.body;
    const rawUserId = req.user.id || req.user._id || req.user.userId;

    if (!rawUserId) {
      return res.status(400).json({ message: 'User ID missing in token payload' });
    }

    const currentUserId = rawUserId.toString();

    const newMed = new Medicine({
      user: currentUserId,
      userId: currentUserId,
      name,
      dosage,
      time,
      stock: Number(stock) || 10
    });

    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete medicine (Only logged-in user can delete their own medicine)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.user.id || req.user._id || req.user.userId;

    if (!rawUserId) {
      return res.status(400).json({ message: 'User ID missing in token payload' });
    }

    const currentUserId = rawUserId.toString();

    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    });

    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicine not found or unauthorized' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
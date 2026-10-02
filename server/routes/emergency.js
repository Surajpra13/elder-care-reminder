const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Emergency = require('../models/Emergency');

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

// 1. Get all emergency contacts for logged-in user only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: 'User ID missing in token' });
    }

    const contacts = await Emergency.find({
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add emergency contact
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: 'User ID missing in token' });
    }

    const { name, relation, phone } = req.body;
    const newContact = new Emergency({
      user: currentUserId,
      userId: currentUserId,
      name,
      relation,
      phone
    });

    const saved = await newContact.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete emergency contact (only logged-in user can delete their own contact)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id || req.user.userId;

    const deleted = await Emergency.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { user: currentUserId },
        { userId: currentUserId }
      ]
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
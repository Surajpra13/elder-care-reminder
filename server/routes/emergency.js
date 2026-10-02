const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Emergency = require('../models/Emergency');

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

// 1. Get all emergency contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await Emergency.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add emergency contact
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, relation, phone } = req.body;
    const newContact = new Emergency({
      user: req.user.id,
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

// 3. Delete emergency contact
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Emergency.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
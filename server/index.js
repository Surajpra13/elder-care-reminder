const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'eldercare_super_secret_key_123';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Auth Token Middleware
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

// --- SCHEMAS & MODELS ---

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'elder' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Medicine Model
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },
  stock: { type: Number, default: 10 },
  userId: { type: String, required: true },
  user: { type: String }
}, { timestamps: true });
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

// Appointment Model
const AppointmentSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  hospital: { type: String, default: 'Clinic Visit' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: String, required: true }
}, { timestamps: true });
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

// Emergency Contact Model
const EmergencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: String, required: true }
}, { timestamps: true });
const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);

// Family / Caregiver Model
const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'Primary Caregiver' },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', FamilyMemberSchema);

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.send('Elder Care Reminder API is running!');
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: role || 'elder' });
    await user.save();

    const uIdStr = user._id.toString();
    const token = jwt.sign(
      { id: uIdStr, _id: uIdStr, userId: uIdStr, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: uIdStr, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const uIdStr = user._id.toString();
    const token = jwt.sign(
      { id: uIdStr, _id: uIdStr, userId: uIdStr, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: uIdStr, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Auth: Forgot / Reset Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email aur naya password dono daalna zaroori hai' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Is email se koi user registered nahi mila' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password successfully change ho gaya! Ab naye password se login karein.' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset karne me error aaya' });
  }
});

// ==========================================
// 💊 MEDICINES (STRICT USER ISOLATION)
// ==========================================
app.get('/api/medicines', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const data = await Medicine.find({
      $or: [
        { userId: currentUserId },
        { user: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medicines' });
  }
});

app.post('/api/medicines/add', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const { name, dosage, time, stock } = req.body;

    const item = new Medicine({
      name,
      dosage,
      time,
      stock: Number(stock) || 10,
      userId: currentUserId,
      user: currentUserId
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding medicine' });
  }
});

app.delete('/api/medicines/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const deleted = await Medicine.findOneAndDelete({
      _id: req.params.id,
      $or: [{ userId: currentUserId }, { user: currentUserId }]
    });

    if (!deleted) return res.status(404).json({ message: 'Medicine not found or unauthorized' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting medicine' });
  }
});

// ==========================================
// 📅 APPOINTMENTS (STRICT USER ISOLATION)
// ==========================================
app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const data = await Appointment.find({ userId: currentUserId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

app.post('/api/appointments/add', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const item = new Appointment({
      ...req.body,
      userId: currentUserId
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding appointment' });
  }
});

app.delete('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    await Appointment.findOneAndDelete({ _id: req.params.id, userId: currentUserId });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

// ==========================================
// 🚨 EMERGENCY CONTACTS
// ==========================================
app.get('/api/emergency', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const data = await Emergency.find({ userId: currentUserId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emergency contacts' });
  }
});

app.post('/api/emergency/add', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    const item = new Emergency({
      ...req.body,
      userId: currentUserId
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding emergency contact' });
  }
});

app.delete('/api/emergency/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = String(req.user.id || req.user._id || req.user.userId);
    await Emergency.findOneAndDelete({ _id: req.params.id, userId: currentUserId });
    res.json({ message: 'Emergency contact deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting emergency contact' });
  }
});

// Family / Caregiver Routes
app.get('/api/family', async (req, res) => {
  try {
    const members = await FamilyMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching family members' });
  }
});

app.post('/api/family/add', async (req, res) => {
  try {
    const newMember = new FamilyMember(req.body);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ message: 'Error adding family member' });
  }
});

app.delete('/api/family/:id', async (req, res) => {
  try {
    await FamilyMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting member' });
  }
});

// --- ADMIN MANAGEMENT ROUTES ---
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ _id: -1 });
    const usersData = await Promise.all(
      users.map(async (u) => {
        const uIdStr = u._id.toString();
        const userMedsCount = await Medicine.countDocuments({
          $or: [{ userId: uIdStr }, { user: uIdStr }]
        });
        const userApptsCount = await Appointment.countDocuments({ userId: uIdStr });

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          medicineCount: userMedsCount,
          appointmentCount: userApptsCount,
          status: 'Active'
        };
      })
    );

    res.json(usersData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin users data' });
  }
});

// Database Connection & Server Listen
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully!'))
    .catch((err) => console.error('Connection Error:', err.message));
} else {
  console.log('Running without MONGO_URI from env');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
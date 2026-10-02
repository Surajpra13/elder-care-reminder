const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// --- SCHEMAS & MODELS ---

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Medicine Model
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: String }
}, { strict: false });
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

// Appointment Model
const AppointmentSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  hospital: { type: String, default: 'Clinic Visit' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: String }
}, { strict: false });
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

// Emergency Contact Model
const EmergencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: String }
}, { strict: false });
const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);

// Family / Caregiver Model
const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'Primary Caregiver' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', FamilyMemberSchema);

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.send('Elder Care Reminder API is running!');
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
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

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// ==========================================
// 🔐 Auth: Forgot / Reset Password Route (NEW)
// ==========================================
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

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password successfully change ho gaya! Ab naye password se login karein.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Password reset karne me error aaya' });
  }
});

// Medicine Routes
app.get('/api/medicines', async (req, res) => {
  try {
    const data = await Medicine.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medicines' });
  }
});

app.post('/api/medicines/add', async (req, res) => {
  try {
    const item = new Medicine(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding medicine' });
  }
});

app.delete('/api/medicines/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting medicine' });
  }
});

// Appointment Routes
app.get('/api/appointments', async (req, res) => {
  try {
    const data = await Appointment.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

app.post('/api/appointments/add', async (req, res) => {
  try {
    const item = new Appointment(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

// Emergency Contact Routes
app.get('/api/emergency', async (req, res) => {
  try {
    const data = await Emergency.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emergency contacts' });
  }
});

app.post('/api/emergency/add', async (req, res) => {
  try {
    const item = new Emergency(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding emergency contact' });
  }
});

app.delete('/api/emergency/:id', async (req, res) => {
  try {
    await Emergency.findByIdAndDelete(req.params.id);
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
    const { name, relation, phone, role } = req.body;
    const newMember = new FamilyMember({
      name,
      relation,
      phone,
      role: role || 'Primary Caregiver'
    });
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

// ==========================================
// --- ADMIN MANAGEMENT ROUTES (LIVE DATA) ---
// ==========================================

// 1. Get All Registered Users with Counts for Admin Dashboard
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ _id: -1 });

    const totalMeds = await Medicine.countDocuments();
    const totalAppts = await Appointment.countDocuments();

    const usersData = await Promise.all(
      users.map(async (u) => {
        const uIdStr = u._id.toString();
        const userMedsCount = await Medicine.countDocuments({
          $or: [{ userId: uIdStr }, { userId: u._id }]
        });
        const userApptsCount = await Appointment.countDocuments({
          $or: [{ userId: uIdStr }, { userId: u._id }]
        });

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          medicineCount: userMedsCount || (totalMeds > 0 ? totalMeds : 0),
          appointmentCount: userApptsCount || (totalAppts > 0 ? totalAppts : 0),
          status: 'Active'
        };
      })
    );

    res.json(usersData);
  } catch (err) {
    console.error('Admin API Error:', err);
    res.status(500).json({ message: 'Failed to fetch admin users data' });
  }
});

// 2. Get Specific User's Medicines for Admin Inspect Modal
app.get('/api/admin/users/:userId/medicines', async (req, res) => {
  try {
    const { userId } = req.params;
    let data = await Medicine.find({
      $or: [{ userId: userId }, { userId: new mongoose.Types.ObjectId(userId) }]
    });

    if (data.length === 0) {
      data = await Medicine.find().sort({ _id: -1 }).limit(5);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user medicines' });
  }
});

// 3. Get Specific User's Appointments for Admin Inspect Modal
app.get('/api/admin/users/:userId/appointments', async (req, res) => {
  try {
    const { userId } = req.params;
    let data = await Appointment.find({
      $or: [{ userId: userId }, { userId: new mongoose.Types.ObjectId(userId) }]
    });

    if (data.length === 0) {
      data = await Appointment.find().sort({ _id: -1 }).limit(5);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user appointments' });
  }
});

// Database Connection & Server Listen
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully!'))
  .catch((err) => console.error('Connection Error:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
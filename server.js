const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mkay-apartments';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured');
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
  console.log('Cloudinary configured via CLOUDINARY_URL');
} else {
  console.warn('Cloudinary not configured. Uploads will fail.');
}

// Paths
const DATA_FILE = path.join(__dirname, 'data', 'cms.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── HELPERS ──────────────────────────────────────────────────────────────────
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading data:', err);
    return null;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
}

function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading bookings:', err);
    return [];
  }
}

function writeBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing bookings:', err);
    return false;
  }
}

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

function validateToken(req) {
  const token = req.headers.authorization || req.body?.token;
  return token === 'admin_token_123';
}

// ── API ───────────────────────────────────────────────────────────────────────

// Get CMS state
app.get('/api/state', (req, res) => {
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Could not read state' });
  const { pin, ...stateData } = data;
  res.json(stateData);
});

// Auth (PIN)
app.post('/api/auth', (req, res) => {
  const { pin } = req.body;
  const data = readData();
  const expected = data?.pin || ADMIN_PIN;
  if (pin === expected) return res.json({ success: true, token: 'admin_token_123' });
  return res.status(401).json({ success: false, message: 'Invalid PIN' });
});

// Change PIN
app.put('/api/pin', (req, res) => {
  const { token, oldPin, newPin } = req.body;
  if (token !== 'admin_token_123') return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = readData();
  const expected = data?.pin || ADMIN_PIN;
  if (oldPin !== expected) return res.status(400).json({ success: false, message: 'Incorrect current PIN' });
  const updated = data || {};
  updated.pin = newPin;
  if (writeData(updated)) return res.json({ success: true, message: 'PIN updated successfully' });
  res.status(500).json({ success: false, message: 'Failed to save PIN' });
});

// Save CMS state (admin)
app.put('/api/state', (req, res) => {
  const { token, state } = req.body;
  if (token !== 'admin_token_123') return res.status(401).json({ success: false, message: 'Unauthorized' });
  const current = readData() || {};
  const pin = current.pin || ADMIN_PIN;
  const newData = { pin, ...state };
  if (writeData(newData)) return res.json({ success: true });
  res.status(500).json({ success: false, message: 'Failed to save state' });
});

// Upload image -> Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const token = req.headers.authorization;
  if (token !== 'admin_token_123') return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_URL) {
    return res.status(500).json({ success: false, message: 'Cloudinary not configured' });
  }
  try {
    const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDER);
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      raw: result
    });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// Delete image from Cloudinary
app.delete('/api/cloudinary', async (req, res) => {
  if (!validateToken(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ success: false, message: 'publicId is required' });
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Cloudinary delete failed:', err);
    res.status(500).json({ success: false, message: 'Delete failed: ' + err.message });
  }
});

// Bookings — create
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  if (!booking || !booking.name || !booking.phone || !booking.checkin || !booking.checkout || !booking.apartment) {
    return res.status(400).json({ success: false, message: 'Missing required booking fields' });
  }
  const newBooking = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: 'new',
    ...booking
  };
  const bookings = readBookings();
  bookings.unshift(newBooking);
  if (!writeBookings(bookings)) return res.status(500).json({ success: false, message: 'Could not save booking' });
  res.json({ success: true, booking: newBooking });
});

// Bookings — list (admin)
app.get('/api/bookings', (req, res) => {
  const token = req.headers.authorization;
  if (token !== 'admin_token_123') return res.status(401).json({ success: false, message: 'Unauthorized' });
  const bookings = readBookings();
  res.json({ success: true, bookings });
});

// Bookings — update status
app.patch('/api/bookings/:id/status', (req, res) => {
  const token = req.headers.authorization;
  if (token !== 'admin_token_123') return res.status(401).json({ success: false, message: 'Unauthorized' });
  const bookingId = req.params.id;
  const { status } = req.body;
  const validStatuses = ['new', 'confirmed', 'cancelled', 'completed'];
  if (!bookingId || !status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking ID or status' });
  }
  const bookings = readBookings();
  const idx = bookings.findIndex(b => String(b.id) === String(bookingId));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  bookings[idx].status = status;
  bookings[idx].updatedAt = new Date().toISOString();
  if (!writeBookings(bookings)) return res.status(500).json({ success: false, message: 'Could not save booking' });
  res.json({ success: true, booking: bookings[idx] });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to data file
const DATA_FILE = path.join(__dirname, 'data', 'cms.json');

// Setup multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname)); // Serve static files from root
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper function to read data
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return null; // File doesn't exist
        }
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error("Error reading data:", err);
        return null;
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error("Error writing data:", err);
        return false;
    }
}

const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

function readBookings() {
    try {
        if (!fs.existsSync(BOOKINGS_FILE)) {
            return [];
        }
        const rawData = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error("Error reading bookings:", err);
        return [];
    }
}

function writeBookings(bookings) {
    try {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error("Error writing bookings:", err);
        return false;
    }
}

// --- API ROUTES ---

// 1. Get State
app.get('/api/state', (req, res) => {
    const data = readData();
    if (data) {
        // Don't send PIN to frontend
        const { pin, ...stateData } = data;
        res.json(stateData);
    } else {
        res.status(500).json({ error: "Could not read state" });
    }
});

// 2. Auth (Verify PIN)
app.post('/api/auth', (req, res) => {
    const { pin } = req.body;
    const data = readData();
    
    if (data && data.pin === pin) {
        // Return a simple token (in a real app, use JWT)
        res.json({ success: true, token: "admin_token_123" });
    } else {
        res.status(401).json({ success: false, message: "Invalid PIN" });
    }
});

// 3. Change PIN
app.put('/api/pin', (req, res) => {
    const { token, oldPin, newPin } = req.body;
    
    // Very basic auth check
    if (token !== "admin_token_123") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const data = readData();
    if (data && data.pin === oldPin) {
        data.pin = newPin;
        if (writeData(data)) {
            res.json({ success: true, message: "PIN updated successfully" });
        } else {
            res.status(500).json({ success: false, message: "Failed to save PIN" });
        }
    } else {
        res.status(400).json({ success: false, message: "Incorrect current PIN" });
    }
});

// 4. Update State
app.put('/api/state', (req, res) => {
    const { token, state } = req.body;
    
    if (token !== "admin_token_123") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const data = readData();
    if (data) {
        // Keep the PIN, update everything else
        const pin = data.pin;
        const newData = { pin, ...state };
        
        if (writeData(newData)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: "Failed to save state" });
        }
    } else {
        res.status(500).json({ success: false, message: "Server error reading data" });
    }
});

// 5. Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    const token = req.headers.authorization;
    
    if (token !== "admin_token_123") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    // Return the URL path to the uploaded file
    const url = `uploads/${req.file.filename}`;
    res.json({ success: true, url });
});

// Booking inquiry storage endpoint
app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    if (!booking || !booking.name || !booking.phone || !booking.checkin || !booking.checkout || !booking.apartment) {
        return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    const bookings = readBookings();
    bookings.push({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'new',
        ...booking
    });

    if (!writeBookings(bookings)) {
        return res.status(500).json({ success: false, message: 'Could not save booking' });
    }

    res.json({ success: true, message: 'Booking inquiry saved' });
});

app.get('/api/bookings', (req, res) => {
    const token = req.headers.authorization;
    if (token !== "admin_token_123") {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookings = readBookings();
    res.json({ success: true, bookings });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

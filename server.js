const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://studentattendancetracker.netlify.app'
}));
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// Direct MongoDB connection string
const MONGODB_URI = 'mongodb+srv://darylledg17:111222333123dg.@studentattendancetracke.mgtphku.mongodb.net/attendance_tracker?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Changed to port 3005 to avoid conflicts
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

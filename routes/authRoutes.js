const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, studentId, name } = req.body;
        const user = new User({ username, password, role, studentId, name });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            'your-secret-key', // Replace with actual secret key in production
            { expiresIn: '24h' }
        );

        // Include studentId in the response for student accounts.
        res.json({ token, role: user.role, studentId: user.studentId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('studentId name username'); // Don't send password
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete route for a student
router.delete('/students/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update password route
router.put('/update-password/:id', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = password; // Assuming you have a pre-save hook to hash the password
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;

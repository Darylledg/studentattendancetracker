const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Student check-in route
router.post('/check-in', async (req, res) => {
    try {
        const { studentId } = req.body;
        
        // Verify student exists
        const student = await User.findOne({ studentId, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingAttendance = await Attendance.findOne({
            studentId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        // Create new attendance record
        const attendance = new Attendance({
            studentId,
            studentName: student.name,
            date: new Date(),
            status: 'present',
            checkInTime: new Date()
        });
        await attendance.save();

        res.status(201).json({ message: 'Check-in successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get attendance records
router.get('/records', async (req, res) => {
    try {
        const { date } = req.query;
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);

        const records = await Attendance.find({
            date: {
                $gte: queryDate,
                $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
            }
        }).sort({ checkInTime: -1 });

        res.json(records);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update attendance status (admin only)
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const attendance = await Attendance.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get attendance history for a student
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const records = await Attendance.find({ studentId }).sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all attendance records
router.get('/all-records', async (req, res) => {
    try {
        const records = await Attendance.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router; 
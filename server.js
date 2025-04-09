// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Using port 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database (simple JSON file for demonstration)
const REGISTRATIONS_FILE = path.join(__dirname, 'registrations.json');

// Initialize empty registrations file if it doesn't exist
if (!fs.existsSync(REGISTRATIONS_FILE)) {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([]));
}

// Read registrations from the file
function getRegistrations() {
    const data = fs.readFileSync(REGISTRATIONS_FILE);
    return JSON.parse(data);
}

// Write registrations to the file
function saveRegistrations(registrations) {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
}

// Routes
// Get all registrations (admin only in a real app)
app.get('/api/registrations', (req, res) => {
    const registrations = getRegistrations();
    res.json(registrations);
});

// Submit a new registration
app.post('/api/registrations', (req, res) => {
    try {
        const { name, email, studentId, batch, message } = req.body;
        
        // Validation
        if (!name || !email || !studentId || !batch) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        // Generate invitation ID
        const namePart = name.substring(0, 3).toUpperCase();
        const idPart = studentId.substring(studentId.length - 4);
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const invitationId = `INV-${namePart}${idPart}-${randomPart}`;
        
        // Create new registration
        const newRegistration = {
            id: invitationId,
            name,
            email,
            studentId,
            batch,
            message: message || '',
            registrationDate: new Date().toISOString()
        };
        
        // Save to "database"
        const registrations = getRegistrations();
        
        // Check if student is already registered
        const existingRegistration = registrations.find(reg => 
            reg.email === email || reg.studentId === studentId
        );
        
        if (existingRegistration) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are already registered for this event',
                existingInvitationId: existingRegistration.id
            });
        }
        
        registrations.push(newRegistration);
        saveRegistrations(registrations);
        
        // Send success response with invitation details
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            invitationId: newRegistration.id,
            registration: newRegistration
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error, please try again later'
        });
    }
});

// Get a specific registration by ID
app.get('/api/registrations/:id', (req, res) => {
    const { id } = req.params;
    const registrations = getRegistrations();
    const registration = registrations.find(reg => reg.id === id);
    
    if (!registration) {
        return res.status(404).json({
            success: false,
            message: 'Invitation not found'
        });
    }
    
    res.json({
        success: true,
        registration
    });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
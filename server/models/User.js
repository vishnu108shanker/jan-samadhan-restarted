const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName:      { type: String, required: true },   // "Priya Sharma"
    phone:         { type: String, required: true, unique: true }, // "9876543210" — primary identity
    email:         { type: String, required: true, unique: true },
    aadhaarLast4:  { type: String, required: true, length: 4 },   // Only last 4 digits. NEVER store full Aadhaar.
    passwordHash:  { type: String, required: true },   // bcrypt hash — never plain text
    role:          { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('User' , userSchema ) ;
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({

  token: { type: String, required: true },

  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  description: { type: String, required: true },

  department: { type: String, enum: ['Roads', 'Water', 'Sanitation', 'Electricity', 'Health', 'Education'], required: true },

  location: { type: String, required: true },

  photoUrl: String,

  status: { type: String, enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved'], default: 'Submitted' },

  officerNotes: String,
  
  createdAt: { type: Date, default: Date.now },

  resolvedAt: Date

});

module.exports = mongoose.model('Issue', issueSchema);
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  eventTitle: {
    type: String,
    required: [true, 'Event title is required'],
  },
  eventLink: {
    type: String,
    required: [true, 'Event link is required'],
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});


emailSchema.index({ email: 1, eventTitle: 1 }, { unique: true });

module.exports = mongoose.model('Email', emailSchema);


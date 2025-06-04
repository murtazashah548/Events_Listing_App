const express = require('express');
const router = express.Router();
const Email = require('../models/Email');


router.post('/capture-email', async (req, res) => {
  const { email, eventTitle, eventLink } = req.body;

  try {
    const newEntry = new Email({ email, eventTitle, eventLink });
    await newEntry.save();

    res.status(201).json({ success: true, message: 'Email captured successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already subscribed for this event.' });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;

const dotenv = require ('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const scrapeEvents = require('./scraper/scrapeEvents');
const Event = require('./models/Event');
const Email = require('./models/Email');

const app = express();
const PORT =  process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json()); // ⬅️ Important: needed to parse JSON POST requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

  app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Route: Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Route: Capture email for event
app.post('/api/capture-email', async (req, res) => {
  try {
    const { email, eventTitle, eventLink } = req.body;

    // Basic validation
    if (!email || !eventTitle || !eventLink) {
      return res.status(400).json({
        success: false,
        message: 'Email, event title, and event link are required'
      });
    }

    // Check for existing entry
    const existing = await Email.findOne({ email, eventTitle });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event!'
      });
    }

    // Create and save
    const newEmail = new Email({ email, eventTitle, eventLink });
    await newEmail.save();

    console.log(`📧 Email saved: ${email} for ${eventTitle}`);
    res.json({
      success: true,
      message: 'Successfully registered!',
      redirectUrl: eventLink
    });

  } catch (error) {
    console.error('❌ Email capture error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Route: Get all captured emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ subscribedAt: -1 });
    res.json({ success: true, emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route: Get email stats per event
app.get('/api/email-stats', async (req, res) => {
  try {
    const stats = await Email.aggregate([
      {
        $group: {
          _id: '$eventTitle',
          count: { $sum: 1 },
          emails: { $push: '$email' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await scrapeEvents();
});

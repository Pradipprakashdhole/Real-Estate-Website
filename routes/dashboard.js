const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const ensureAuth = require('../middleware/auth');

// GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const properties = await Property.find({ user: req.session.user._id });
    res.render('dashboard', { properties });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;

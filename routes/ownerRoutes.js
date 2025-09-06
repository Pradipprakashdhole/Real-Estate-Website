// routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/owner/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('Owner not found');
    }
    res.render('owner-details', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

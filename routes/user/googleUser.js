const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Start Google OAuth process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  // Generate a JWT token after successful Google login
  const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY_TOKEN, { expiresIn: '1h' });
  res.redirect(`/profile?token=${token}`); // Redirect with token in query params
});

module.exports = router;

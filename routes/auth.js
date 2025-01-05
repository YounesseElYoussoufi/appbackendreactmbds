const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
const CLIENT_URL = "http://localhost:3000/";

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

// In auth.js routes
router.get('/verify-email/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find and update the user
      const user = await User.findOneAndUpdate(
        { _id: decoded.userId },
        { isVerified: true },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
    }
  });

// Google Auth Routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      const token = generateToken(req.user);
      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
  );
  
  // GitHub Auth Routes
  router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );
  
  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
      const token = generateToken(req.user);
      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
  );
  
  // LinkedIn Auth Routes
  router.get('/linkedin',
    passport.authenticate('linkedin')
  );
  
  router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    (req, res) => {
      const token = generateToken(req.user);
      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
  );
  
  module.exports = router;
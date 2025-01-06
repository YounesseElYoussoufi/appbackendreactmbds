const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); 
const nodemailer = require('nodemailer');

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
const CLIENT_URL = "http://localhost:5173/";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});


// Register route
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      isVerified: false
    });

    // Save user to database
    await user.save();

    // Generate verification token
    const verificationToken = generateToken(user);

    // Send verification email
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Welcome to Student Management System</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({ 
      token, 
      user,
      message: 'Registration successful. Please check your email to verify your account.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email verification route
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

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Validate password (you can use bcrypt.compare if passwords are hashed)
    const isMatch = await user.comparePassword(password); // Ensure `comparePassword` is a method on the User model
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


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
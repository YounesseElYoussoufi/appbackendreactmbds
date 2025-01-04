const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../model/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Invalid credentials' });
    if (!user.verified) return done(null, false, { message: 'Please verify your email first' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return done(null, false, { message: 'Invalid credentials' });
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id, provider: 'google' });
    
    if (!user) {
      user = await User.create({
        providerId: profile.id,
        provider: 'google',
        email: profile.emails[0].value,
        fullName: profile.displayName,
        username: profile.emails[0].value.split('@')[0],
        verified: true
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id, provider: 'github' });
    
    if (!user) {
      user = await User.create({
        providerId: profile.id,
        provider: 'github',
        email: profile.emails[0].value,
        fullName: profile.displayName,
        username: profile.username,
        verified: true
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: '/api/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id, provider: 'linkedin' });
    
    if (!user) {
      user = await User.create({
        providerId: profile.id,
        provider: 'linkedin',
        email: profile.emails[0].value,
        fullName: profile.displayName,
        username: profile.emails[0].value.split('@')[0],
        verified: true
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
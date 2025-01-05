const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const passport = require("passport");
const User = require('./model/User');
require('dotenv').config();

const GOOGLE_CLIENT_ID =
  "your id";
const GOOGLE_CLIENT_SECRET = "your id";

GITHUB_CLIENT_ID = "your id";
GITHUB_CLIENT_SECRET = "your id";

FACEBOOK_APP_ID = "your id";
FACEBOOK_APP_SECRET = "your id";


passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
},
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }
  
        const newUser = new User({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          googleId: profile.id,
          provider: 'google',
          profilePicture: profile.photos[0].value,
          isVerified: true // Google accounts are pre-verified
        });
  
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  ));
  
  // GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback",
    scope: ['user:email']
},
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }
  
        const newUser = new User({
          email: profile.emails[0].value,
          firstName: profile.displayName.split(' ')[0],
          lastName: profile.displayName.split(' ')[1] || '',
          githubId: profile.id,
          provider: 'github',
          profilePicture: profile.photos[0].value,
          isVerified: true
        });
  
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  ));
  
  // LinkedIn Strategy
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "/api/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile']
},
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ linkedinId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }
  
        const newUser = new User({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          linkedinId: profile.id,
          provider: 'linkedin',
          profilePicture: profile.photos[0].value,
          isVerified: true
        });
  
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  ));
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Routes
const student = require('./routes/students');
const user  = require('./routes/users');
const course = require('./routes/courses');
const grade = require('./routes/grades');
const authRoute = require('./routes/auth');

const nodemailer = require('nodemailer');
// Passport config
require('./passport');

// Generate session secret
const generateSessionSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};




// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || generateSessionSecret();
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        httpOnly: true
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.Promise = global.Promise;
const uri = 'mongodb+srv://dakoukyelmestapha:qtsDKxwrrco9Ven5@cluster0.r1k9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(uri)
    .then(() => {
        console.log("Successfully connected to MongoDB.");
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

// Route prefixes
const prefix = '/api';

// Routes
app.use("/auth", authRoute);

// Student routes
app.route(prefix + '/students')
    .get(student.getAll)
    .post(student.create);
app.route(prefix + '/students/:id')
    .put(student.update)
    .delete(student.remove);


// User routes
// User routes
app.route(prefix + '/users')
    .get(user.getAll) // Appel à la fonction getAll pour récupérer tous les utilisateurs
    .post(user.createUser); // Fonction pour créer un utilisateur

app.route(prefix + '/users/:id')
    .put(user.updateUser) // Mettre à jour un utilisateur
    .delete(user.deleteUser); // Supprimer un utilisateur
app.route(prefix + '/users/:id/verify')
    .patch(user.toggleVerification); 
// Course routes


app.route(prefix + '/courses')
    .get(course.getAll)
    .post(course.create);
app.route(prefix + '/courses/:id')
    .put(course.update)
    .delete(course.remove);
    

// Grade routes
app.route(prefix + '/grades')
    .get(grade.getAll)
    .post(grade.create);
app.route(prefix + '/grades/:id')
    .put(grade.update)
    .delete(grade.remove);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Server startup
const port = process.env.PORT || 8010;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
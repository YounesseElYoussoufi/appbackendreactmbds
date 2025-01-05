let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let student = require('./routes/students');
let course = require('./routes/courses'); // Pas besoin de spécifier .js, Node.js le trouve automatiquement
let grade = require('./routes/grades');


const cookieSession = require("cookie-session");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");


app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
  

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// TODO remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud
const uri = 'mongodb+srv://dakoukyelmestapha:qtsDKxwrrco9Ven5@cluster0.r1k9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const options = {};

mongoose.connect(uri, options)
    .then(() => {
            console.log("Connexion à la base OK");
        },
        err => {
            console.log('Erreur de connexion: ', err);
        });

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Pour les formulaires
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

// les routes
const prefix = '/api';

app.use("/auth", authRoute);

app.route(prefix + '/students')
    .get(student.getAll)
    .post(student.create)
    ;
app.route(prefix + '/students/:id') // Ajout de :id dans l'URL
    .put(student.update)
    .delete(student.remove);


app.route(prefix + '/courses')
    .get(course.getAll)
    .post(course.create);



app.route(prefix + '/courses/:id') // Pour les opérations spécifiques
    .put(course.update)
    .delete(course.remove);

    

app.route(prefix + '/grades')
    .get(grade.getAll)
    .post(grade.create);
app.route(prefix + '/grades/:id')
    .put(grade.update)
    .delete(grade.remove);
// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;


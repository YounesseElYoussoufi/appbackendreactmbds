let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let neighbor = require('./routes/neighbors');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud s
const uri = 'mongodb+srv://gobelins:oo7hrJ1Nznu1OCvL@cluster0.phksz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const options = {};

mongoose.connect(uri, options)
    .then(() => {
            console.log("Connecté à la base MongoDB neighbors dans le cloud !");
            console.log("at URI = " + uri);
            console.log("vérifiez with http://localhost:8010/api/neighbors que cela fonctionne")
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

app.route(prefix + '/neighbors')
    .get(neighbor.getAll)
    .post(neighbor.create);

app.route(prefix + '/neighbors/:id')
    .get(neighbor.getOne)
    .delete(neighbor.deleteOne)
    .put(neighbor.update);

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;



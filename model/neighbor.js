let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let NeighborSchema = Schema({
    name: String,
    avatarUrl: String,
    aboutMe: String,
    phone: String,
    address: String,
    isFavorite: Boolean,
    webSite: String
});

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Neighbor', NeighborSchema);

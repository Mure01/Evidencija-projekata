const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema(
    {
    radnik: {
        type: String,
        require: true
    },
    radnikId: {
        type: String,
        require: true
    },
 
    projekat: {
        type: String,
        ref: 'Projects',
        require: true
    },
    zadatak: {
        type: String,
        ref: 'Tasks',
        require: true
    },
    naslov: {
        type: String,
        require: true
    },
    opisAktivnosti: {
        type: String,
        require: true
    },
    datum: {
        type: Date,
        require: true
    },
    vrijemePocetka:{
        type: Date,
        require: true
    },
    vrijemeKraja: {
        type: Date,
        required:true
    }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Activity', activitySchema);

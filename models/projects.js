const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectsSchema = new Schema(
    {
        nazivProjekta: {
            type: String,
            require: true
        },
       
        menadzer: {
            type: String,
            require: true
        },
       
        datumPocetka: {
            type: Date,
            require: true
        },
       
        datumKraja: {
            type: Date,
            require: true
        },
       
        status: {
            type: String,
            require: true
        },
       
        radnici: [{type: String, ref: 'Users'}],
        opis: {
            type: String,
            require: true
        }
   },
   {timestamps: true}

);

module.exports = mongoose.model('Projects', projectsSchema);

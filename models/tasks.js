const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tasksSchema = new Schema(
    {
    nazivZadatka: {
        type: String,
        require: true
    },
    projekat: {
        type: String,
        ref: 'Projects',
        require: true
    },
    opisZadatka: {
        type: String,
        require: true
    },
    datumKraja: {
        type: Date,
        require: true
    },
    datumPocetka:{
        type: Date,
        require: true
    },
    status: {
        type: String,
        required:true
    }
    },
    {timestamps: true}

);

module.exports = mongoose.model('Tasks', tasksSchema);

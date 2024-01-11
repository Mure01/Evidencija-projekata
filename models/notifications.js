const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationsSchema = new Schema(
    {       
            imePosiljaoca:{
                type: String
            },
            primaoc: {
                type: String,
                ref: 'Users'
            },
            procitano: {
                type: String,
                default: '0'
            },
            posiljaoc: {
                type: String,
                ref: 'Users'
            },
            poruka: {
                type: String,
                require: true
            },
            vrsta: {
                type: String,
                default: 'poruka'
            },
            projekat: {
                type: String
            }
    },
    {timestamps: true}

);

module.exports = mongoose.model('Notifications', notificationsSchema);

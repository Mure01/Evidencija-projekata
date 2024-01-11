const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema(
    {

        ime: {
            type:String,
            require: true
        },
        prezime: {
            type:String,
            require: true
        },
        pravilo: {
            type:String,
            require: true
        },
        email: {
            type:String,
            require: true,
            unique: true
        },
        username: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true
        },
        administrator: {
            type: Boolean,
            default: false
        },
        online: {
            type: String,
            default: '0'
        }
        
    },
    {timestamps: true}

);

module.exports = mongoose.model('Users', usersSchema);

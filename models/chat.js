const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {       
            imePosiljaoca: {
                type: String,
                require: true
            },
            posiljaoc: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            primaoc: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            poruka: {
                type: String,
                require: true
            }
    },
    {timestamps: true}

);

module.exports = mongoose.model('Chat', chatSchema);

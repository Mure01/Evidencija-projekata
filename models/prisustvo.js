const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prisustvoSchema = new Schema(
    {       
            radnikId: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Users'
            },
            vrijemeDolaska: {
                type: Date,
                default: Date.now
            },
            vrijemeOdlaska: {
                type: Date,
                default: null
            },
    },
    {timestamps: true}

);

module.exports = mongoose.model('Prisustvo', prisustvoSchema);

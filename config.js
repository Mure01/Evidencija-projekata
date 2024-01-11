const mongoose = require('mongoose');
require('dotenv').config();
const nodemailer = require('nodemailer');


mongoURI=process.env.LINK_BAZE;

mongoose.connect(mongoURI)
  .then(console.log("connected succesfuly"))
  .catch(err => console.log(err));

const transporter = nodemailer.createTransport({
  service: 'gmail', // možete koristiti i druge servise poput 'yahoo', 'outlook', itd.
  auth: {
    user: 'belci911mu@gmail.com',
    pass: process.env.MAIL_SIFRA,
  },
});
if (!transporter) {
  console.error('Greška prilikom kreiranja transportera.');
}
  
module.exports ={ mongoose, transporter};
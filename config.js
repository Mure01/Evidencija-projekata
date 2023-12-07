const mongoose = require('mongoose');

mongoURI = 'mongodb+srv://admin:admin123@cluster0.rck8nfb.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(console.log("connected succesfuly"))
  .catch(err => console.log(err));
module.exports = mongoose;
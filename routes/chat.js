var express = require('express');
var router = express.Router();
const usersModel = require('../models/users')
const chatModel = require('../models/chat')
const isAuth = (req, res, next) => {
  if(req.session.isAuth){
        next();
    }else {
        res.redirect('/')
    }
}


router.get('/chat', isAuth,  async function(req, res, next) {

  const radnici = await usersModel.find();
  const userId = req.session.userId;
  const ime = req.session.userIme;

  res.render('chat', {admin: req.session.admin, radnici: radnici, ime: ime, userId: userId});

});


router.post('/dodajPoruku', isAuth, async (req, res, next) => {
  const {posiljaoc, primaoc, poruka, ime} = req.body;
  const novaPoruka = new chatModel({
    imePosiljaoca: ime,
    posiljaoc: posiljaoc,
    primaoc: primaoc,
    poruka:poruka
  })

  
  await novaPoruka.save();
  res.status(200).send({success: true, poruka: req.body})
})


module.exports = router;

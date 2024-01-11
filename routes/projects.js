var express = require('express');
var router = express.Router();

const {listaProjekataAdmin, listaProjekataRadnik,
     dodajProjekatAdmin, azurirajProjekatAdmin, 
     urediProjekatAdmin, detaljiProjekta} = require('../controllers/projectController');
const projects = require('../models/projects');
const tasks = require('../models/tasks');

const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next();
    }else {
        res.redirect('/')
    }
  }
  const isAdmin = (req, res, next) => {
    if(req.session.admin){
        next();
    }else {
        res.redirect('/users')
    }
  }

//Adminske postavke o projektu

router.get('/listaProjekata', isAuth, isAdmin, listaProjekataAdmin )

router.post('/dodajProjekat', isAdmin, isAuth, dodajProjekatAdmin )

router.get('/urediProjekat/:id', isAdmin, isAuth, urediProjekatAdmin )

router.post('/azurirajProjekat/:id', isAdmin, isAuth, azurirajProjekatAdmin )

//Korisnicke postavke o projektu

router.get('/projectDetails/:id', isAuth, detaljiProjekta );

router.get('/listaProjekataZaRadnika', isAuth, listaProjekataRadnik )

router.get('/kalendar',isAuth,async (req, res, next) => {
    var projekti = [], zadaci, projektiRadnika;
    projektiRadnika = await projects.find();
    if(!req.session.admin) {
        var username = req.session.username;

        projektiRadnika.map((projekat) => {
          if(projekat.radnici.includes(username) || projekat.menadzer === username){
            projekti.push(projekat)
          }
        })
    }
    else{
        projekti=projektiRadnika
    }

    const projektniIdovi = projekti.map(projekt => projekt._id);
    zadaci = await tasks.find({ projekat: { $in: projektniIdovi } }).populate('projekat');
    res.render('calendar',{projekti, zadaci, admin: req.session.admin}) 
})

module.exports = router;

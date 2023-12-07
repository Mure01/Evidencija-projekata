const express = require('express');
const router = express.Router();
const projectsModel = require('../models/projects');
const userModel = require('../models/users');
const tasksModel = require('../models/tasks');
const mongoose = require('../config');

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



router.post('/dodajProjekat', isAdmin, isAuth, async (req, res, next) => {

    const {nazivProjekta, pocetniDatum, menadzer, status, datumIsteka, radnici, opis} = req.body;
    const newProject = new projectsModel(
        {
            nazivProjekta: nazivProjekta,
            datumPocetka: pocetniDatum,
            menadzer: menadzer,
            status: status,
            datumKraja: datumIsteka,
            radnici: radnici,
            opis: opis
        }
    )
    await newProject.save();

    res.redirect('/admin/listprojects');
})

router.get('/listaProjekata', isAdmin, isAuth,  async (req, res, next) => {

    const projekti = await performLookup();
    res.render('admin/listprojects', { projekti: projekti, admin: req.session.admin})

})


router.get('/urediProjekat/:id', isAdmin, isAuth, async (req, res, next) => {

    const id = req.params.id;
    const projekti = await performLookup();
    var projekatSve = {};
    projekti.map((projekat) => {
      if(projekat._id == id){
        projekatSve = projekat;
      }
    })
    console.log( "Projekat sve:" +projekatSve);
    const menadzeri = await userModel.find({pravilo: "Menadzer"});
    const radnici = await userModel.find({pravilo: "Radnik"});
   
    res.render('admin/editproject', { projekat: projekatSve, menadzeri: menadzeri, radnici: radnici, admin: req.session.admin});

});


router.post('/azurirajProjekat/:id', isAdmin, isAuth, async (req, res, next) => {
  const id = req.params.id;
  const {nazivProjekta, pocetniDatum, menadzer, status, datumIsteka, radnici, opis} = req.body;
  
  
  console.log(req.body);
  await projectsModel.findByIdAndUpdate(id, {
    nazivProjekta: nazivProjekta,
    datumPocetka: pocetniDatum,
    datumKraja: datumIsteka,
    menadzer: menadzer,
    radnici: radnici,
    opis: opis,
    status:status
  });

  res.redirect('/listaProjekata');
})


router.get('/projectDetails/:id', isAuth, isAdmin, async function(req, res, next) {

  const id = req.params.id;
  const projekti = await performLookup();
  var projekatZasebno = {};
  projekti.map((projekat) => {
    if(projekat._id == id){
      projekatZasebno = projekat;
    }
  })
  console.log(projekatZasebno);

  const zadaci = await tasksModel.find();

  res.render('admin/projectDetails', {projekat: projekatZasebno, zadaci: zadaci, admin: req.session.admin});
});



const performLookup = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Connection to MongoDB is not established');
          }
      const result = await projectsModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'radnici',
            foreignField: 'username',
            as: 'radnici_info'
          }
        },
        {
            $lookup: {
              from: 'users',
              localField: 'menadzer',
              foreignField: 'username',
              as: 'menadzer_info'
            }
          }
      ]).exec();
  
      return result;
    } catch (error) {
      console.error('Greška prilikom izvršavanja lookup operacije:', error);
    } 
  };
  

module.exports = router;
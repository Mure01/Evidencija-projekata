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
router.get('/listTasks', isAuth, isAdmin, async (req, res, next) => {

    const zadaci = await tasksModel.find().populate('projekat','nazivProjekta');
    console.log(zadaci)
    res.render('admin/tasks', {zadaci: zadaci, admin: req.session.admin});

});


router.post('/dodajZadatak', isAdmin, isAuth, async (req, res, next) => {
    const {projekatId, nazivZadatka, pocetniDatum, zavrsniDatum, status, opisZadatka} = req.body;
    
    console.log(req.body);
    const task = new tasksModel({
        nazivZadatka: nazivZadatka,
        projekat: projekatId,
        opisZadatka: opisZadatka,
        datumKraja: zavrsniDatum,
        datumPocetka: pocetniDatum,
        status: status,
    })
    await task.save();
    
    res.redirect('/listTasks');
})

router.get('/lista', isAdmin, isAuth,  async (req, res, next) => {


})



module.exports = router;
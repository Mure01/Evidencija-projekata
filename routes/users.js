var express = require('express');
var router = express.Router();
const projectsModel = require('../models/projects')
const tasksModel = require('../models/tasks')
const userModel = require('../models/users')

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
      next();
  }else {
      res.redirect('/')
  }
}

router.get('/', isAuth, async function(req, res, next) {

  const projektiRadnika = await projectsModel.find();

  var projekti = [];
  var username = req.session.username;

  projektiRadnika.map((projekat) => {
    if(projekat.radnici.includes(username) || projekat.menadzer === username){
      projekti.push(projekat)
    }
  })

  async function dobaviPodatke() {
      var projektiStatus = [];
      var sviZadaci = 0;
      var spisakStatusaZadataka = [];
      var zavrseniZadaci = 0;
      var uIzradiZadaci = 0;
      var naCekanjuZadaci = 0;
      await Promise.all(projekti.map(async (projekat) => {
          const zadaci = await tasksModel.find({ projekat: projekat.id });
          var uradjeniZadaci = 0;
  
          zadaci.forEach((zadatak) => {
              if (zadatak.status == "zavrsen") {
                  uradjeniZadaci++;
                  zavrseniZadaci++;
              }
              else if (zadatak.status == "izrada") {
                  uIzradiZadaci++;
              }
              else {
                  naCekanjuZadaci++;
              }
          });
          const cistiProjekat = projekat.toObject();
          sviZadaci += zadaci.length;
          projektiStatus.push({
              sviZadaci: sviZadaci,
              sviProjekti: projekti.length,
              uradjeniZadaci: uradjeniZadaci,
              brojZadataka: zadaci.length,
              projekat:{...cistiProjekat}
          });
      }));
      spisakStatusaZadataka.push({
          zavrseniZadaci: zavrseniZadaci,
          uIzradiZadaci: uIzradiZadaci,
          naCekanjuZadaci: naCekanjuZadaci
      })
      const rezultat = {projektiStatus, spisakStatusaZadataka};
      return rezultat
  }

  const zadaci = await tasksModel.find().populate({path: 'projekat',select: 'radnici menadzer nazivProjekta'});
  const radnikId = req.session.userId;
  const radnik = await userModel.find({_id : radnikId});
  const radnikUsername = req.session.username;
  var zadaciRadnik = [];
  zadaci.map((zadatak) => {
      if(zadatak.projekat.radnici.includes(radnikUsername) || zadatak.projekat.menadzer === radnikUsername){
          zadaciRadnik.push(zadatak);
      }
  })
  
  const rezultat = await dobaviPodatke();
  res.render('users/users', {admin: req.session.admin,zadaci:zadaciRadnik, projekti: rezultat.projektiStatus, spisakZadataka: rezultat.spisakStatusaZadataka});

});

module.exports = router;

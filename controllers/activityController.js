const express = require('express');
const router = express.Router();
const tasksModel = require('../models/tasks');
const projectModel = require('../models/projects');
const activityModel = require('../models/activity');

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
      next();
  }else {
      res.redirect('/')
  }
}

router.post('/dodajAktivnost', isAuth, async (req, res, next) => {
    const {radnik, radnikId, projekatId, zadatakId, naslovAktivnost, datum, pocetnoVrijeme, zavrsnoVrijeme, opisAktivnosti} = req.body;
    
    const  satiPocetnoVrijeme= pocetnoVrijeme.slice(0, 2);
    const minutePocetnoVrijeme = pocetnoVrijeme.slice(3);
    const datumPocetnoVrijeme = new Date();
    datumPocetnoVrijeme.setHours(satiPocetnoVrijeme, minutePocetnoVrijeme);

    const  satiZavrsnoVrijeme= zavrsnoVrijeme.slice(0, 2);
    const minuteZavrsnoVrijeme = zavrsnoVrijeme.slice(3);
    const datumZavrsnoVrijeme = new Date();
    datumZavrsnoVrijeme.setHours(satiZavrsnoVrijeme, minuteZavrsnoVrijeme);

    const activity = new activityModel ({
        naslov: naslovAktivnost,
        radnik: radnik,
        radnikId: radnikId,
        zadatak: zadatakId,
        projekat: projekatId,
        opisAktivnosti: opisAktivnosti,
        vrijemePocetka: datumPocetnoVrijeme,
        vrijemeKraja: datumZavrsnoVrijeme,
        datum: datum
    })

    await activity.save();

    res.redirect('/projectDetails/'+projekatId);

})


module.exports = router;
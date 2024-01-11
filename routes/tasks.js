var express = require('express');
var router = express.Router();

const {listaZadatakaAdmin, listaZadatakaRadnik, dodajZadatak, azurirajZadatak} = require('../controllers/tasksController')

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

  const isAdminOrManager = (req, res, next) => {
    if(req.session.admin || req.session.manager){
        next();
    }else {
        res.redirect('/users')
    }
  }

router.get('/listTasks', isAuth, isAdmin, listaZadatakaAdmin)

router.get('/listTasksRadnik', isAuth, listaZadatakaRadnik)

router.post('/dodajZadatak', isAdminOrManager, isAuth, dodajZadatak)

router.post('/azurirajZadatak/:id', isAdminOrManager, isAuth, azurirajZadatak)



module.exports = router;

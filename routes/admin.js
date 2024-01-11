var express = require('express');
var router = express.Router();
var userModel = require('../models/users');
const { izvjestaj, adminPanel } = require('../controllers/adminController');
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

const isAdminOrManager = (req, res, next) => {
    if(req.session.admin || req.session.manager){
        next();
    }else {
        res.redirect('/users')
    }
  }

const updateProjectStatus = async (req, res, next) => {
    const projekti = await projects.find();
    const zadaci = await tasks.find();

    projekti.map((projekat) => {
        let zadaciUIzradi = 0;
        let zadaciZavrseni = 0;
        let cekanjeZadaci = 0;
        let ukupnoZadatak = 0;
        zadaci.map((zadatak) => {
            if(zadatak.projekat === projekat._id.toString()){
                ukupnoZadatak++
                if(zadatak.status === 'izrada'){
                    zadaciUIzradi++
                }else if(zadatak.status === 'zavrsen'){
                    zadaciZavrseni++
                }else if(zadatak.status === 'cekanje'){
                    cekanjeZadaci++
                }
        }
        })
        if(zadaciUIzradi > 0 || (zadaciZavrseni >0 && zadaciZavrseni < ukupnoZadatak)) {
            const update = async () => {
                try {
                    await projects.findByIdAndUpdate(projekat._id, {status: 'izrada'})
                } catch (error) {
                  console.error('Greška prilikom ažuriranja projekta:', error);
                }
              };
              update();
         }
        if(zadaciZavrseni == ukupnoZadatak && ukupnoZadatak != 0) {
            const update = async () => {
                try {
                    await projects.findByIdAndUpdate(projekat._id, { status: 'zavrsen' });
                } catch (error) {
                  console.error('Greška prilikom ažuriranja projekta:', error);
                }
              };
              update();
        }
       if(cekanjeZadaci == ukupnoZadatak || ukupnoZadatak == 0){
            const update = async () => {
                try {
                    await projects.findByIdAndUpdate(projekat._id, {status: 'cekanje'})
                } catch (error) {
                    console.error('Greška prilikom ažuriranja projekta:', error);
                }};
              update();
    }

    })
    next()

}

router.get('/', isAuth, isAdmin,updateProjectStatus, adminPanel);

router.get('/reports', isAuth, isAdminOrManager, izvjestaj);


router.get('/adduser', isAuth, isAdmin, function(req, res, next) {
    res.render('admin/adduser', {admin: req.session.admin});
});


router.get('/addproject', isAuth, isAdmin, async function(req, res, next) {
    const menadzeri = await userModel.find({pravilo: "Menadzer"});
    const radnici = await userModel.find({pravilo: "Radnik"});
    res.render('admin/addproject', {menadzeri: menadzeri, radnici: radnici, admin: req.session.admin});
});



module.exports = router;

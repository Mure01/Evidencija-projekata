const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const kript = require('bcryptjs')

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

router.post('/dodajRadnika', isAdmin, isAuth, async (req, res, next) => {
    const {ime, prezime, pravilo, email, username, password, passworddva} = req.body;

    if(password !== passworddva){
        return res.status(400).send("Lozinke se ne podudaraju");
     }

     const salt = kript.genSaltSync();
     const savepass = kript.hashSync(password, salt);

    var admin = false;

    if(pravilo == "Admin") {
         admin = true 
    }else {
        admin = false;
    }
    const newuser = new userModel(
        {ime: ime,
        prezime: prezime, 
        pravilo: pravilo, 
        email: email,
        username: username,
        password: savepass,
        administrator: admin
    }
    );
    await newuser.save();

    res.redirect('/admin');
})

router.get('/listaRadnika',  isAdmin, isAuth, async (req, res, next) => {

    const radnici = await userModel.find();

    res.render('admin/listusers', {radnici: radnici ,admin: req.session.admin});

})

router.post('/obrisiRadnika/:id', isAdmin, isAuth, async (req, res, next) => {
    const idRadnika = req.params.id;
    await userModel.findByIdAndDelete(idRadnika);  
    res.redirect('/listaRadnika');
});


module.exports = router;
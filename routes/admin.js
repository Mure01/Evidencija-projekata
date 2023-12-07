var express = require('express');
var router = express.Router();
var userModel = require('../models/users');

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

router.get('/', isAuth, isAdmin, function(req, res, next) {
    res.render('admin/admin', {admin: req.session.admin});
});

router.get('/adduser', isAuth, isAdmin, function(req, res, next) {
    res.render('admin/adduser', {admin: req.session.admin});
});


router.get('/addproject', isAuth, isAdmin, async function(req, res, next) {
    const menadzeri = await userModel.find({pravilo: "Menadzer"});
    const radnici = await userModel.find({pravilo: "Radnik"});
    res.render('admin/addproject', {menadzeri: menadzeri, radnici: radnici, admin: req.session.admin});
});



module.exports = router;

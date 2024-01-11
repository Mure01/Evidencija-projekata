const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const kript = require('bcryptjs')
const prisustvo = require('../models/prisustvo')

router.post('/login', async (req, res) => {

    const {username, password} = req.body;
    const user = await userModel.findOne({username});

    if(!user) {
        return res.redirect('/');
    }
    

    const isMatch = await kript.compare(password, user.password);

    if(!isMatch){
        return res.redirect('/');
    }
    
    var isAdmin = false;
    var isManager = false;
    if(user.pravilo ==="Admin"){
        isAdmin = true;
    }else if(user.pravilo === "Menadzer"){
        isManager = true;
    }


    const prisustvoPrijava = new prisustvo ({
        radnikId: user.id,
    })
    await prisustvoPrijava.save()


    req.session.isAuth = true;
    req.session.admin = isAdmin;
    req.session.manager = isManager;
    req.session.userIme = user.ime;
    req.session.username = user.username;
    req.session.userPrezime = user.prezime;
    req.session.userId = user.id;

    if(isAdmin){
        return res.redirect('/admin');
    }
    
    res.redirect('/users')
  })
  
router.post('/logout', async (req, res) => {
    
    await prisustvo.updateOne( {radnikId: req.session.userId, vrijemeOdlaska:null}, {$set: {vrijemeOdlaska: new Date() }})

    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/');
    })
  })

module.exports = router;
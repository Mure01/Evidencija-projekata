const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const kript = require('bcryptjs')

router.post('/login', async (req, res) => {

    const {username, password} = req.body;
    const user = await userModel.findOne({username});

    if(!user) {
        return res.redirect('/');
    }
    

    const isAdmin = user.administrator;
    const isMatch = await kript.compare(password, user.password);

    if(!isMatch){
        return res.redirect('/');
    }

    req.session.isAuth = true;
    req.session.admin = isAdmin;

    if(isAdmin){
        return res.redirect('/admin');
    }
    
    res.redirect('/users')
  })
  
router.post('/logout', (req, res) => {

    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/');
    })
  })

module.exports = router;
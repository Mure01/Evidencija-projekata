var express = require('express');
var router = express.Router();

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
    if(req.session.admin){
      res.redirect('/admin')
    }else{
      res.redirect('/users')
    }
  }else {
    next();
  }
}


router.get('/', isAuth,  async function(req, res, next) {

  res.render('index');

});

module.exports = router;

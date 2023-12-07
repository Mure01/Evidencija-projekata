var express = require('express');
var router = express.Router();

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
      next();
  }else {
      res.redirect('/')
  }
}

router.get('/', isAuth, function(req, res, next) {

  res.render('users/users', {admin: req.session.admin})

});

module.exports = router;

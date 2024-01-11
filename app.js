var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('./config');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const usersModel = require('./models/users')

// routers for app
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var loginRouter = require('./routes/login');
var dodajProjekat = require('./routes/projects');
var dodajZadatak = require('./routes/tasks');
var chatRouter = require('./routes/chat');
var dodajRadnika = require('./controllers/userController');
var dodajAktivnost = require('./controllers/activityController');

var app = express();

// set connection with mongoDB
//session use
app.use(session({
  secret: 'Cookie',
  resave: false,
  saveUninitialized: false,
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Midleware fukncija za chat

app.use(async (req, res, next) => {
  const isUserLoggedIn = req.session.userId !== undefined;

  if (isUserLoggedIn) {
    const radnici = await usersModel.find();
    const trenutniRadnik = await usersModel.findById(req.session.userId);
    res.locals.chatData = {
      radnici: radnici,
      ime: req.session.userIme,
      userId: req.session.userId,
      imePrezime: trenutniRadnik.ime + " " + trenutniRadnik.prezime,
      emailRadnika: trenutniRadnik.email,
      username: req.session.username 

    };
  }
  next();
  });


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/', loginRouter);
app.use('/', dodajRadnika);
app.use('/', dodajProjekat);
app.use('/', dodajZadatak);
app.use('/', dodajAktivnost);
app.use('/', chatRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

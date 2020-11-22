var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var session=require('express-session')
var fileUpload=require('express-fileupload');
var Handlebars=require('handlebars');
var db=require('./config/connection');
const { connected } = require('process');

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({extname:'hbs',defaultLayout: 'main',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));
app.set('view engine', 'hbs');
// app.engine('hbs',hbs({extname:'hbs',defualtLayout:'main',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
// app.use(express.bodyParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({secret:"key",cookie:{maxAge:600000}}))

db.connect((err)=>{
  if(err)
  console.log('connection error'+err)
  else console.log('connection successfull')
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

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

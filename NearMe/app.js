let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/apiCalls');
let loginRouter = require('./routes/login');
let mapsRouter = require('./routes/maps.js');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', apiRouter);
app.use('/login', loginRouter);
app.use('/maps', mapsRouter);

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

app.set('views', path.join(__dirname, '/views'));
app.set('maps', path.join(__dirname, '/map_folder'));
//app.set('maps', path.join(__dirname, '/map_folder'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

//from the slides
//var serverParams = require('config.json')('./config/config.json');
//app.set('serverParams', serverParams.server);

//set up encryption key for sessions
//app.use(session({secret: serverParams.server.sessionSecret}));

module.exports = app;

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

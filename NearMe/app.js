let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let passport = require('passport');
let cookieSession = require('cookie-session');

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/apiCalls');
let loginRouter = require('./routes/login');
let mapsRouter = require('./routes/maps.js');

let app = express();

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config/config'); 
const User = require('./database/nearmedb');

    passport.use(
        new GoogleStrategy({
            callbackURL: '/auth/google/redirect',
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret
    }, (token, refreshToken, profile, done) => {
        User.findOne({'id': profile.id}, 
        function(err, user) {
           if (!user) {
            user = new User({
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                favorites: []
    
            })
            user.save(function(err) {
                if (err) console.log(err);
                return done(err, user);
            })
           }
           else {
            return done(err, user);
           }
        })
}
        )
   );

  
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


app.get('/',
    function(req, res){
        res.render('../views/login', { user: req.user });
    }); 

app.use(cookieSession({
    name: 'session',
    keys: ['fuh4t87yrhf'],
    maxAge: 24 * 60 * 60 * 1000
}));
app.use(cookieParser());

app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.render('./login');
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/redirect', passport.authenticate('google', {
      failureRedirect: '/login'}),
  (req, res) => {
      req.session.token = req.user.token;
      res.redirect('/homepage');
  }
);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

module.exports = app;

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

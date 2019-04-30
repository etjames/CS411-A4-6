const express = require('express'),
    app = express(),
    passport = require('passport'),
    auth = require('./auth'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');

const User = require('../nearmedb');

const config = require('../config/config');

const GoogleStrategy = require('passport-google-oauth')
    .OAuth2Strategy;

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nearme', {useNewUrlParser: true}, function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    }
});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
}); 

auth(passport);
app.use(passport.initialize());

app.set('view engine', 'ejs');


app.get('/login',
  function(req, res){
    res.render('../login');
  });

  app.get('/homepage',
  function(req, res){
    res.render('../homepage');
  });

app.use(cookieSession({
    name: 'session',
    keys: ['fuh4t87yrhfu4'],
    maxAge: 24 * 60 * 60 * 1000
}));
app.use(cookieParser());


app.get('/', (req, res) => {
    if (req.session) {
        res.redirect('./homepage');
    } else {
        res.redirect('./login');
        };
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/login');
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/redirect',
    passport.authenticate('google', {
        failureRedirect: 'login'}),
    (req, res) => {
        req.session.token = req.user.token;
        console.log('hi look below')
        console.log(req.user.token);
        res.redirect('/homepage');
    }
);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

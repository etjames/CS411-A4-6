const express = require('express'),
    app = express(),
    passport = require('passport'),
    auth = require('../oauth/auth'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');

const User = require('../database/nearmedb');

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

app.get('/',
    function(req, res){
    console.log("using this...");
        res.render('../views/login');
    });

app.get('/homepage',
    function(req, res){
        res.render('../views/homepage');
    });

app.use(cookieSession({
    name: 'session',
    keys: ['fuh4t87yrhfu4'], //TODO: hide this.
    maxAge: 24 * 60 * 60 * 1000
}));
app.use(cookieParser());


app.get('/', (req, res) => {
    if (req.session) {
        console.log("in here");
        res.redirect('../views/homepage');
    } else {
        res.redirect('../views/login');
    };
});

app.get('/logout', (req, res) => {
    console.log("trying to log out..");
    req.logout();
    req.session = null;
    res.render('../views/login');
});




app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/redirect', (req, res) => {
    passport.authenticate('local',
        { successRedirect: '../views/homepage',
            failureRedirect: '../views/login'},
        function(err, user, info) {
            console.log("callback function called");
            if (err) { return err; }
            if (!user) { res.render('/login'); }
            req.logIn(user, function(err) {
                if (err) { return err; }
                res.render('/views/homepage');
            });
        }

    );
    res.render('../views/homepage');
});

app.get('/auth/google/redirect',
    passport.authenticate('google', {
        failureRedirect: '../views/login'}),
    (req, res) => {
        req.session.token = req.user.token;
        console.log(req.user.token);
        res.redirect('../views/homepage');
    }
);


/*
app.get('/auth/google', function(req, res, next) {


    console.log("get request received");
    const handler = passport.authenticate('google',

        {scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
            successRedirect: '../views/homepage',
            failureRedirect: '../views/login' ,
            failureFlash: "invalid username or password",
            successFlash: 'SUCCESS!'
        },


        function(err, user, info) {
        console.log("callback function was called.");
        if (err) { return next(err); }
        if (!user) { res.render('/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            console.log("RENDER HOMEPAGE");
            res.render('/views/homepage');
        });
    });

    handler(req, res, next);

});

app.get('/auth/google/redirect', function(req, res, next) {

    console.log("get request for redirect received");
    const handler = passport.authenticate('google',

        {scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
            successRedirect: '../views/homepage',
            failureRedirect: '../views/login' ,
            failureFlash: "invalid username or password",
            successFlash: 'SUCCESS!',
            uri: '../login/auth/google/redirect'
        },


        function(err, user, info) {
            console.log("callback function was called.");
            if (err) { console.log("ERROR 1"); console.log(err); return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
                if (err) { console.log("ERROR 2"); return next(err); }
                console.log("RENDER HOMEPAGE");
                return res.redirect('/views/homepage');
            });
        });

    handler(req, res, next);

});




app.get('/auth/google', passport.authenticate('google', {
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
}));

app.get('/auth/google/redirect', (req, res) => {



    console.log("redirect worked.");

    passport.authenticate('local',
        { successRedirect: '../views/homepage',
            failureRedirect: '../views/login' ,
            failureFlash: "invalid username or password",
            successFlash: 'SUCCESS!' },
        function(err, user, info) {
            console.log("callback function called");
            if (err) { return err; }
            if (!user) { res.render('/login'); }
            req.logIn(user, function(err) {
                if (err) { return err; }
                res.render('/views/homepage');
            });
        }

        );

    console.log("passport authentication worked.");

    //res.render('../views/homepage');
});
(

app.get('/auth/google/redirect', function(req, res, next) {

    passport.authenticate('google',

        { successRedirect: '../views/homepage',
                  failureRedirect: '../views/login' ,
                  failureFlash: "invalid username or password",
                  successFlash: 'SUCCESS!' },

        function(err, user, info) {
            console.log("callback function called");
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/views/homepage');
            });
        })(req, res, next);


}  );



app.get('/auth/google/redirect',
    passport.authenticate('google', {
        failureRedirect: '../views/login'}),

    (req, res) => {
        req.session.token = req.user.token;
        console.log('hi look below')
        console.log(req.user.token);
        res.render('../views/homepage');
    }
);





app.get('/auth/google/redirect',
    passport.authenticate('google', {
        failureRedirect: '../views/login'}),



    (req, res) => {
        req.session.token = req.user.token;
        console.log('hi look below')
        console.log(req.user.token);
        res.render('../views/homepage');
    }
);
*/
module.exports = app;

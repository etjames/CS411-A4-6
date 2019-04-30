const GoogleStrategy = require('passport-google-oauth/lib')
    .OAuth2Strategy;
const config = require('../config/config'); 
const User = require('../database/nearmedb');

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(
        new GoogleStrategy({
            callbackURL: '../login/auth/google/redirect',
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret
    }, (token, refreshToken, profile, done) => {
<<<<<<< HEAD:NearMe/views/auth.js
=======
        //console.log(profile.emails[0].value);
        //console.log(token);
        //console.log(profile.id);
>>>>>>> 60ba87cd321425f1ccbae3137b01ffd3cff145c9:NearMe/oauth/auth.js
        User.findOne({'id': profile.id}, 
        function(err, user) {
           if (!user) {
            user = new User({
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                favorites: null
    
            })
            user.save(function(err) {
                console.log(_id);
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
<<<<<<< HEAD:NearMe/views/auth.js
    }

=======
}
>>>>>>> 60ba87cd321425f1ccbae3137b01ffd3cff145c9:NearMe/oauth/auth.js

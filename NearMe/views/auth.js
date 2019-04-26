const GoogleStrategy = require('passport-google-oauth')
    .OAuth2Strategy;
const config = require('../config/config'); 
const User = require('../nearmedb');

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(
        new GoogleStrategy({
            callbackURL: '/auth/google/redirect',
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret
    }, (token, refreshToken, profile, done) => {
        console.log(profile.emails[0].value);
        console.log(token);
        console.log(profile.id);
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
    }
        )
}
        )
   );
    }

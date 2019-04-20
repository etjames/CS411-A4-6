const GoogleStrategy = require('passport-google-oauth')
    .OAuth2Strategy;
const config = require('../config/config'); 

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
        return done(null, {
            profile: profile,
            token: token
        });
    }));
};

// EXPRESS AND MONGOOSE FILES //
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('./server/config/mongoose');

// MODELS //
var User = require('./server/models/user')

// GOOGLE AUTH //
var googleAuth = require('./server/config/googleAuth');

// RUN EXPRESS AND MONGOOSE //
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var db = mongoose();

// PASSPORT //
var passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: googleAuth.googleAuth.clientID,
    clientSecret: googleAuth.googleAuth.clientSecret,
    callbackURL: googleAuth.googleAuth.callbackURL
}, function (req, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({ 'google.id': profile.id }, function (err, user) {
            if (err) return done(err);
            if (user) {
                return done(null, user);
            } else {
                var newUser = new User()
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.displayName;
                newUser.google.image = profile._json.image.url;
                newUser.google.email = profile.emails[0].value;
                newUser.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));

// EXPRESS SESSION // 
var session = require('express-session');

app.use(session({ secret: 'i like the codez' }));;

// SERIALIZE USER //
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// TEST ENDPOINT //
app.post('/api/test', function (req, res, next) {
    res.status(200).send(req.body.msg + ' EVERYTHING OK');
});

// GOOGLE AUTH ENDPOINTS //
app.get('/auth/google', passport.authenticate('google', {
    session: false,
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/#/user',
    failure: '/#/login'
}));






// PORT //
var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('Listenting on port ' + port);
});
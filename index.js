// EXPRESS
require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
  res.render('pages/auth');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

// Passport setup
const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', isLoggedIn, (req, res) => res.render('pages/success', { user: userProfile }));
app.get('/error', (req, res) => res.send('Error logging in'));

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Google AUTH
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy(
  {
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
  }
));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    res.redirect('/success');
  }
);
app.get('/auth/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
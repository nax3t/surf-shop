require('dotenv').config();

const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const seedPosts = require('./seeds');
// seedPosts();

// require routes
const index = require('./routes/index');
const posts = require('./routes/posts');
const reviews = require('./routes/reviews');

const app = express();

// connect to the database
mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/surf-shop');

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Add moment to every view
app.locals.moment = require('moment');

// Configure Passport and Sessions
app.use(session({
  secret: 'hang ten dude!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use((req, res, next) => {
  // Add flash method to request object
  req.flash = (type, message) => {
    req.session.flash = req.session.flash || {};
    req.session.flash[type] = message;
  };
  next();
});

// Configure Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        
        console.log('Found user:', user);
        console.log('Attempting to compare:', password, 'with:', user.password);
        
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Set local variables middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // Initialize flash messages
  res.locals.success = '';
  res.locals.error = '';
  // Get flash messages and clear them
  if (req.session.flash) {
    res.locals.success = req.session.flash.success || '';
    res.locals.error = req.session.flash.error || '';
    delete req.session.flash;
  }
  // set default page title
  res.locals.title = 'Surf Shop';
  next();
});

// Mount routes
app.use('/', index);
app.use('/posts', posts);
app.use('/posts/:id/reviews', reviews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // Log the error with stack trace
  console.error('Error:', err);
  if (err.stack) console.error(err.stack);
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
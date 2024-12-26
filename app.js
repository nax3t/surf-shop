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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err, null);
  }
});

// Set local variables middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // Set default page title
  res.locals.title = 'Surf Shop';
  // Set success flash message
  res.locals.success = req.session.success || '';
  delete req.session.success;
  // Set error flash message
  res.locals.error = req.session.error || '';
  delete req.session.error;
  // Continue on to next middleware
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
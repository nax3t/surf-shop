const User = require("../models/user");
const Post = require("../models/post");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const passport = require("passport");
const util = require("util");

module.exports = {
  // GET /
  async landingPage(req, res, next) {
    const posts = await Post.find({}).sort('-_id').exec();
    const recentPosts = posts.slice(0, 3);
    res.render('index', { posts, mapBoxToken, recentPosts, title: 'Surf Shop - Home' });
  },

  // GET /register
  getRegister(req, res, next) {
    if (req.isAuthenticated()) {
      req.flash('error', 'Please logout before registering a new user.');
      return res.redirect('back');
    }
    res.render('register', { title: 'Register', username: '', email: '' });
  },

  // POST /register
  async postRegister(req, res, next) {
    try {
        console.log('Registration body:', req.body);
        
        if (!req.body.email || !req.body.password || !req.body.username) {
            throw new Error('Username, email and password are required');
        }

        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        // Handle image upload
        if (req.file) {
            userData.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        const user = new User(userData);
        const savedUser = await user.save();
        console.log('Saved user:', savedUser);

        req.login(savedUser, (err) => {
            if (err) return next(err);
            req.session.success = `Welcome to Surf Shop, ${savedUser.username}!`;
            res.redirect('/');
        });
    } catch (err) {
        console.error('Registration error:', err);
        // If there was an error and we uploaded an image, we should delete it
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        const { username, email } = req.body;
        res.render('register', { 
            title: 'Register', 
            username, 
            email,
            error: err.message 
        });
    }
  },

  // GET /login
  getLogin(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/");
    if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
    res.render("login", { title: "Login" });
  },

  // POST /login
  async postLogin(req, res, next) {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: "Invalid email or password.",
      successFlash: `Welcome back, ${req.body.email}!`,
    })(req, res, next);
  },

  // GET /logout
  getLogout(req, res, next) {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  },

  // GET /profile
  async getProfile(req, res, next) {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({ author: req.user._id }).sort('-_id').exec();
    res.render("profile", { user, posts });
  },
};

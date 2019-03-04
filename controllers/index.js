const User = require('../models/user');
const Post = require('../models/post');
const passport = require('passport');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const util = require('util');
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');

module.exports = {
	// GET /
	async landingPage(req, res, next) {
		const posts = await Post.find({});
		res.render('index', { posts, mapBoxToken, title: 'Surf Shop - Home' });
	},
	// GET /register
	getRegister(req, res, next) {
		res.render('register', { title: 'Register', username: '', email: '' });
	},
	// POST /register
	async postRegister(req, res, next) {
		try {
			if (req.file) {
				const { secure_url, public_id } = req.file;
				req.body.image = { secure_url, public_id };
			}
			const user = await User.register(new User(req.body), req.body.password);
			req.login(user, function(err) {
				if (err) return next(err);
				req.session.success = `Welcome to Surf Shop, ${user.username}!`;
				res.redirect('/');
			});
		} catch(err) {
			deleteProfileImage(req);
			const { username, email } = req.body;
			let error = err.message;
			if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
				error = 'A user with the given email is already registered';
			}
			res.render('register', { title: 'Register', username, email, error });
		}
	},
	// GET /login
	getLogin(req, res, next) {
		if (req.isAuthenticated()) return res.redirect('/');
		if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
		res.render('login', { title: 'Login' });
	},
	// POST /login
	async postLogin(req, res, next) {
		const { username, password } = req.body;
		const { user, error } = await User.authenticate()(username, password);
		if (!user && error) return next(error);
		req.login(user, function(err) {
			if (err) return next(err);
			req.session.success = `Welcome back, ${username}!`;
			const redirectUrl = req.session.redirectTo || '/';
			delete req.session.redirectTo;
			res.redirect(redirectUrl);
		});
	},
	// GET /logout
	getLogout(req, res, next) {
	  req.logout();
	  res.redirect('/');
	},
	async getProfile(req, res, next) {
		const posts = await Post.find().where('author').equals(req.user._id).limit(10).exec();
		res.render('profile', { posts });
	},
	async updateProfile(req, res, next) {
		const {
			username,
			email
		} = req.body;
		const { user } = res.locals;
		if (username) user.username = username;
		if (email) user.email = email;
		if (req.file) {
			if (user.image.public_id) await cloudinary.v2.uploader.destroy(user.image.public_id);
			const { secure_url, public_id } = req.file;
			user.image = { secure_url, public_id };
		}
		await user.save();
		const login = util.promisify(req.login.bind(req));
		await login(user);
		req.session.success = 'Profile successfully updated!';
		res.redirect('/profile');
	}
}

const User = require('../models/user');
const passport = require('passport');

module.exports = {
	// POST /register
	async postRegister(req, res, next) {
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			image: req.body.image
		});

		await User.register(newUser, req.body.password);
		res.redirect('/');
	},
	// POST /login
	postLogin(req, res, next) {
		passport.authenticate('local', {
		  successRedirect: '/',
		  failureRedirect: '/login' 
		})(req, res, next);
	},
	// GET /logout
	getLogout(req, res, next) {
	  req.logout();
	  res.redirect('/');
	}
}
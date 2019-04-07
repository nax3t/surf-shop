const Review = require('../models/review');
const User = require('../models/user');
const Post = require('../models/post');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const middleware = {
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
						 .catch(next);
		},
	isReviewAuthor: async (req, res, next) => {
		let review = await Review.findById(req.params.review_id);
		if(review.author.equals(req.user._id)) {
			return next();
		}
		req.session.error = 'Bye bye';
		return res.redirect('/');
	},
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) return next();
		req.session.error = 'You need to be logged in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/login');
	},
	isAuthor: async (req, res, next) => {
		const post = await Post.findById(req.params.id);
		if (post.author.equals(req.user._id)) {
			res.locals.post = post;
			return next();
		}
		req.session.error = 'Access denied!';
		res.redirect('back');
	},
	isValidPassword: async (req, res, next) => {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if (user) {
			// add user to res.locals
			res.locals.user = user;
			next();
		} else {
			middleware.deleteProfileImage(req);
			req.session.error = 'Incorrect current password!';
			return res.redirect('/profile');
		}
	},
	changePassword: async (req, res, next) => {
		const {
			newPassword,
			passwordConfirmation
		} = req.body;

		if (newPassword && !passwordConfirmation) {
			middleware.deleteProfileImage(req);
			req.session.error = 'Missing password confirmation!';
			return res.redirect('/profile');
		} else if (newPassword && passwordConfirmation) {
			const { user } = res.locals;
			if (newPassword === passwordConfirmation) {
				await user.setPassword(newPassword);
				next();
			} else {
				middleware.deleteProfileImage(req);
				req.session.error = 'New passwords must match!';
				return res.redirect('/profile');
			}
		} else {
			next();
		}
	},
	deleteProfileImage: async req => {
		if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
	},
	async searchAndFilterPosts(req, res, next) {
		const queryKeys = Object.keys(req.query);
		if (queryKeys.length) {
			const dbQueries = [];
			let { search, price, avgRating, location, distance  } = req.query;
			if (search) {
				search = new RegExp(escapeRegExp(search), 'gi');
				dbQueries.push({ $or: [
					{ title: search },
					{ description: search },
					{ location: search }
				]});
			}
			if (location) {
				const response = await geocodingClient
				  .forwardGeocode({
				    query: location,
				    limit: 1
				  })
				  .send();
				// destructure coordinates [ <longitude> , <latitude> ]
				const { coordinates } = response.body.features[0].geometry;
				// get the max distance or set it to 25 mi
				let maxDistance = distance || 25;
				// we need to convert the distance to meters, one mile is approximately 1609.34 meters
				maxDistance *= 1609.34;
				dbQueries.push({
				  geometry: {
				    $near: {
				      $geometry: {
				        type: 'Point',
				        coordinates
				      },
				      $maxDistance: maxDistance
				    }
				  }
				});
			}
			if (price) {
				if (price.min) dbQueries.push({ price: { $gte: price.min } });
				if (price.max) dbQueries.push({ price: { $lte: price.max } });
			}
			if (avgRating) {
				dbQueries.push({ avgRating: { $in: avgRating } });
			}

			// check and build req.query
			const defaultKeys = ['search', 'location', 'distance', 'price', 'avgRating'];		
			defaultKeys.forEach(key => {
				if (!queryKeys.includes(key)) {
					if (key === 'price') { 
						req.query[key] = { min: '', max: '' };
					} else if (key === 'avgRating') {
						req.query[key] = [];
					} else {
						req.query[key] = '';
					}
				}
			});
			// pass database query to next middleware
			res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
		} else {
			req.query = {
				search: '',
				location: '',
				distance: '',
				price: { min: '', max: ''},
				avgRating: []
			}
		}

		// pass query string to view
		res.locals.queryString = '';
		// check if query string exists
	  if (req._parsedUrl.query) {
	  	// remove any page=N or page=N&
	  	let queryString = req._parsedUrl.query.replace(/page=\d+\&|page=\d+/, '');
	  	// if more query string exists, prepend ampersand
	  	if (queryString.length) {
	  		res.locals.queryString = `&${queryString}`;
	  	}
	  }
		// pass req.query to the view to be used in the searchAndFilter partial
		res.locals.query = req.query;
		next();
	}
};

module.exports = middleware;












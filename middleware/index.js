const Review = require('../models/review');
const User = require('../models/user');
const Post = require('../models/post');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTextSearchQuery(search) {
    if (!search) return null;
    const regex = new RegExp(escapeRegExp(search), 'gi');
    return {
        $or: [
            { title: regex },
            { description: regex },
            { location: regex }
        ]
    };
}

async function buildLocationQuery(locationData) {
    if (!locationData) return null;
    
    let coordinates;
    try {
        coordinates = parseLocation(locationData);
        if (!coordinates) {
            const response = await geocodingClient
                .forwardGeocode({
                    query: locationData,
                    limit: 1
                })
                .send();
            coordinates = response.body.features[0].geometry.coordinates;
        }
    } catch (err) {
        return null;
    }

    const maxDistance = (locationData.distance || 25) / 3963.2; // Convert miles to radians
    return {
        geometry: {
            $geoWithin: {
                $centerSphere: [coordinates, maxDistance]
            }
        }
    };
}

function buildPriceRangeQuery(price) {
    if (!price) return null;
    const query = {};
    if (price.min) query.$gte = price.min;
    if (price.max) query.$lte = price.max;
    return Object.keys(query).length ? { price: query } : null;
}

function buildRatingQuery(avgRating) {
    return avgRating ? { avgRating: { $in: avgRating } } : null;
}

function parseLocation(location) {
    try {
        const parsed = JSON.parse(location);
        if (Array.isArray(parsed) && parsed.length === 2) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

function buildPaginationUrl(originalUrl) {
    const url = new URL(originalUrl, 'http://localhost');
    url.searchParams.delete('page');
    return `${url.pathname}${url.search}${url.search ? '&' : '?'}page=`;
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
		if (req.file) await cloudinary.uploader.destroy(req.file.filename);
	},
	async searchAndFilterPosts(req, res, next) {
        try {
            const queryBuilders = {
                search: buildTextSearchQuery,
                location: buildLocationQuery,
                price: buildPriceRangeQuery,
                avgRating: buildRatingQuery
            };

            const dbQueries = await Promise.all(
                Object.entries(req.query)
                    .filter(([key]) => queryBuilders[key])
                    .map(async ([key, value]) => await queryBuilders[key](value))
            );

            const validQueries = dbQueries.filter(Boolean);
            res.locals.dbQuery = validQueries.length ? { $and: validQueries } : {};
            res.locals.query = req.query;
            res.locals.paginateUrl = buildPaginationUrl(req.originalUrl);
            next();
        } catch (err) {
            next(err);
        }
    }
};

module.exports = middleware;

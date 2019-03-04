# Profile Image

**Problem:**
1. Multer and body-parser have to be in a specific order to work properly together. Multer (image upload) wants to be first in line, otherwise we end up with an empty req.body object.

**Scenarios:**
1. A user tries to sign up, but encounters an error somewhere in the process, the already uploaded image needs to be deleted
2. A user signs up successfully, but then tries to update their profile and encounters an error. The already uploaded image must be deleted here, as well.
3. User signs up without issue and/or user updates profile without issue.

**Solution:**
1. Create a middleware that checks if an image is uploaded and deletes it if there is one. Run this middleware any time we encounter an error in the register/update profile process.

## Update user model

### File: /models/user.js

Change:
```JS
image: String
```
to:
```JS
image: {
	secure_url: { type: String, default: '/images/default-profile.jpg' },
	public_id: String
}
```

## Add default profile image to static images

### File: /public/images/default-profile.jpg

Download [this file](https://res.cloudinary.com/devsprout/image/upload/v1551403751/default-profile.jpg) and put it inside of `/public/images`

## Update register.ejs view

### File: /views/register.ejs

Change:
```HTML
<form action="/register" method="POST">
```
to:
```HTML
<form action="/register" method="POST" enctype="multipart/form-data">
```

## Update profile.ejs view

### File: /views/profile.ejs

Change:
```HTML
<h1><%= currentUser.username %>'s Profile</h1>
```
to:
```HTML
<h1><img src="<%= currentUser.image.secure_url %>" alt="<%= currentUser.username %>'s profile image" class="profile-image"> <%= currentUser.username %>'s Profile</h1>
```
---
Change:
```HTML
<form action="/profile?_method=PUT" method="POST">
```
to:
```HTML
<form action="/profile?_method=PUT" method="POST" enctype="multipart/form-data">
```
---
Add:
```HTML
<small>(this deletes existing)</small>
```
After:
```HTML
<label for="image">Image:</label>
```

## Update main stylesheet

### /public/stylsheets/style.css

Add the following code to the bottom of the file:
```CSS
.profile-image {
	width: 100px;
	border-radius: 50%;
}
```

## Update middleware

### File: /middleware/index.js

Add:
```JS
const { cloudinary } = require('../cloudinary');
```
After:
```JS
const Post = require('../models/post');
```
---
Change:
```JS
module.exports = {
```
to:
```JS
const middleware = {
```
---
Add the following code to the bottom of the file:
```JS
module.exports = middleware;
```
---
Change:
```JS
isValidPassword: async (req, res, next) => {
	const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
	if (user) {
		// add user to res.locals
		res.locals.user = user;
		next();
	} else {
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
		req.session.error = 'Missing password confirmation!';
		return res.redirect('/profile');
	} else if (newPassword && passwordConfirmation) {
		const { user } = res.locals;
		if (newPassword === passwordConfirmation) {
			await user.setPassword(newPassword);
			next();
		} else {
			req.session.error = 'New passwords must match!';
			return res.redirect('/profile');
		}
	} else {
		next();
	}
}
```
to:
```JS
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
deleteProfileImage: async (req) => {
	if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
}
```

## Update index controller

### File: /controllers/index.js

Add:
```JS
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
```
After:
```JS
const util = require('util');
```
---
Change:
```JS
// POST /register
async postRegister(req, res, next) {
	try {
		const user = await User.register(new User(req.body), req.body.password);
		req.login(user, function(err) {
			if (err) return next(err);
			req.session.success = `Welcome to Surf Shop, ${user.username}!`;
			res.redirect('/');
		});
	} catch(err) {
		const { username, email } = req.body;
		let error = err.message;
		if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
			error = 'A user with the given email is already registered';
		}
		res.render('register', { title: 'Register', username, email, error });
	}
},
```
to:
```JS
// POST /register
async postRegister(req, res, next) {
	try {
		if (req.file) {
			const { secure_url, public_id } = req.file;
			req.body.image = {
				secure_url,
				public_id
			}
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
```
---
Change:
```JS
async updateProfile(req, res, next) {
	const {
		username,
		email
	} = req.body;
	const { user } = res.locals;
	if (username) user.username = username;
	if (email) user.email = email;
	await user.save();
	const login = util.promisify(req.login.bind(req));
	await login(user);
	req.session.success = 'Profile successfully updated!';
	res.redirect('/profile');
}
```
to:
```JS
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
```

## Update index routes

### File: /routes/index.js

Add:
```JS
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
```
After:
```JS
const router = express.Router();
```
---
Change:
```JS
router.post('/register', asyncErrorHandler(postRegister));
```
to:
```JS
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));
```
---
Change:
```JS
/* PUT /profile */
router.put('/profile',
	isLoggedIn,
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);
```
to:
```JS
/* PUT /profile */
router.put('/profile',
	isLoggedIn,
	upload.single('image'),
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);
```
## Small refactor

### File: /routes/posts.js

Change:
```JS
const { cloudinary, storage } = require('../cloudinary');
```
to:
```JS
const { storage } = require('../cloudinary');
```
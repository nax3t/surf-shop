# Continue User Authentication and Authorization

## Update Register and Login
- Comment out the req.user object assignment in app.js where you're setting a user to always be logged in:
```JS
// req.user = {
//   // '_id' : '5bb27cd1f986d278582aa58c',
//   // '_id' : '5bc521c0b142b6d7f7523406',
//   '_id' : '5bfed10ad176f845e38aec92',
//   'username' : 'ian3'
// }
```
- Add a getRegister method to /controllers/index.js right before existing postRegister method
```JS
// GET /register
getRegister(req, res, next) {
	res.render('register', { title: 'Register' });
},
```
- Add getLogin method to /controllers/index.js right before existing postLogin method
```JS
// GET /login
getLogin(req, res, next) {
	res.render('login', { title: 'Login' });
},
```
- Update postRegister method inside of /controllers/index.js

Replace:
```JS
async postRegister(req, res, next) {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		image: req.body.image
	});

	await User.register(newUser, req.body.password);
	res.redirect('/');
},
```
with:
```JS
async postRegister(req, res, next) {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		image: req.body.image
	});

	let user = await User.register(newUser, req.body.password);
	req.login(user, function(err) {
	  if (err) { return next(err); }
		req.session.success = `Welcome to Surf Shop, ${newUser.username}!`;
	  res.redirect('/');
	});
},
```
- Add getRegister and getLogin methods to /routes/index.js

Replace:
```JS
const { landingPage, postRegister, postLogin, getLogout } = require('../controllers');
```
with:
```JS
const { landingPage, getRegister, postRegister, getLogin, postLogin, getLogout } = require('../controllers');
```
Replace:
```JS
router.get('/register', (req, res, next) => {
  res.send('GET /register');
});
```
with:
```JS
router.get('/register', getRegister);
```
Replace:
```JS
router.get('/login', (req, res, next) => {
  res.send('GET /login');
});
```
with:
```JS
router.get('/login', getLogin);
```

## Create Register and Login Views
- Create a new file inside of /views named register.ejs
- Add the following markup to it:
```HTML
<% layout('layouts/boilerplate') -%>

<form action="/register" method="POST">
	<div>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" placeholder="username" required>
	</div>
	<div>
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" placeholder="password" required>
	</div>
	<div>
		<label for="email">Email:</label>
		<input type="email" id="email" name="email" placeholder="email" required>
	</div>
	<div>
		<label for="image">Image:</label>
		<input type="file" id="image" name="image">
	</div>
	
	<input type="submit">
</form>
```
- Create a new file inside of /views named login.ejs
- Add the following markup to it:
```HTML
<% layout('layouts/boilerplate') -%>

<form action="/login" method="POST">
	<div>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" placeholder="username" required>
	</div>
	<div>
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" placeholder="password" required>
	</div>
	
	<input type="submit">
</form>
```

## Update navbar partial
- Replace entire /views/partials/navbar.ejs file with:
```HTML
<style>
	ul {
	  list-style-type: none;
	  margin: 0;
	  padding: 0;
	}
	li {
	  display: inline;
	  padding: 5px;
	}
</style>
<ul>
	<li><a href="/">Home</a></li>
	<li><a href="/posts">Posts</a></li>
	<% if(!currentUser) { %>
		<li><a href="/register">Register</a></li>
		<li><a href="/login">Login</a></li>
	<% } else { %>
		<li><a href="/posts/new">New Post</a></li>
		<li><a href="/logout">Logout</a></li>
		Welcome, <%= currentUser.username %>!
	<% } %>
</ul>
```

## Enforce Unique Emails
- Replace entire /middleware/index.js file with:
```JS
const Review = require('../models/review');
const User = require('../models/user');

module.exports = {
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
	checkIfUserExists: async (req, res, next) => {
		let userExists = await User.findOne({'email': req.body.email});
		if(userExists) {
			req.session.error = 'A user with the given email is already registered';
			return res.redirect('back');
		}
		next();
	}
}
```
- Update middleware in /routes/index.js

Replace:
```JS
const { asyncErrorHandler } = require('../middleware')
```
with:
```JS
const { asyncErrorHandler, checkIfUserExists } = require('../middleware')
```

Replace:
```JS
router.post('/register', asyncErrorHandler(postRegister));
```
with:
```JS
router.post('/register', asyncErrorHandler(checkIfUserExists), asyncErrorHandler(postRegister));
```

## Add Authorization Middleware
- Still needs to be done...
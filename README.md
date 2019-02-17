# User Profile Pt. 2

## Update flash messages partial

### File: /views/partials/flash-messages.ejs

Change:
```HTML
<% if(success && success.length) { %>
	<h1 style="color: green;"><%= success %></h1>
<% } %>

<% if(error && error.length) { %>
	<h1 style="color: red;"><%= error %></h1>
<% } %>
```
to:
```HTML
<% if(success && success.length) { %>
	<h1 class="color-green"><%= success %></h1>
<% } %>

<% if(error && error.length) { %>
	<h1 class="color-red"><%= error %></h1>
<% } %>
```

## Add classes to main stylesheet

### File: /public/stylesheets/style.css

Add:
```CSS
.color-red {
	color: red;
}
.color-green {
	color: green;
}
```
## Add profile link to navbar

### File: /views/partials/navbar.ejs

Change:
```HTML
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
to:
```HTML
<ul id="navbar">
	<li><a href="/">Home</a></li>
	<li><a href="/posts">Posts</a></li>
	<% if(!currentUser) { %>
	<li><a href="/register">Register</a></li>
	<li><a href="/login">Login</a></li>
	<% } else { %>
	<li><a href="/posts/new">New Post</a></li>
	<li><a href="/profile">Profile</a></li>
	<li><a href="/logout">Logout</a></li>
	Welcome, <%= currentUser.username %>!
	<% } %>
</ul>
```

## Add update form to profile

### File: /views/profile.ejs

Add the following code to the bottom of the file:
```HTML
<p>Update Info:</p>

<form action="/profile?_method=PUT" method="POST" id="update-profile">
	<div>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" placeholder="username" value="<%= currentUser.username %>" autofocus required>
	</div>
	<div>
		<label for="current-password">Current Password (required to update profile):</label>
		<input type="password" id="current-password" name="currentPassword" placeholder="current password" required>
	</div>
	<div>
		<label for="new-password">New Password:</label>
		<input type="password" id="new-password" name="newPassword" placeholder="new password">
	</div>
	<div>
		<label for="password-confirmation">New Password Confirmation:</label>
		<input type="password" id="password-confirmation" name="passwordConfirmation" placeholder="password confirmation">
	</div>
	<div id="validation-message"></div>
	<div>
		<label for="email">Email:</label>
		<input type="email" id="email" name="email" placeholder="email" value="<%= currentUser.email %>" required>
	</div>
	<div>
		<label for="image">Image:</label>
		<input type="file" id="image" name="image">
	</div>

	<input type="submit">
</form>

<script src="/javascripts/profile.js"></script>
```

## Create profile.js file

### Create a file named profile.js inside of /public/javascripts

Add:
```JS
let newPasswordValue;
let confirmationValue;
const form = document.querySelector('form');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message');
function validatePasswords(message, add, remove) {
		validationMessage.textContent = message;
		validationMessage.classList.add(add);
		validationMessage.classList.remove(remove);
}
confirmation.addEventListener('input', e => {
	e.preventDefault();
	newPasswordValue = newPassword.value;
	confirmationValue = confirmation.value;
	if (newPasswordValue !== confirmationValue) {
	  validatePasswords('Passwords must match!', 'color-red', 'color-green');
	} else {
		validatePasswords('Passwords match!', 'color-green', 'color-red');
	}
});

form.addEventListener('submit', e => {
	if (newPasswordValue !== confirmationValue) { 
		e.preventDefault();
		const error = document.getElementById('error');
		if(!error) {
			const flashErrorH1 = document.createElement('h1');
			flashErrorH1.classList.add('color-red');
			flashErrorH1.setAttribute('id', 'error');
			flashErrorH1.textContent = 'Passwords must match!';
			const navbar = document.getElementById('navbar');
			navbar.parentNode.insertBefore(flashErrorH1, navbar.nextSibling);
		}
	}
});
```

## Add isValidPassword and changePassword middleware

### File: /middleware/index.js

Add the following code to the bottom of the module.exports object after the isAuthor method:
```JS
,
	isValidPassword: async (req, res, next) => {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword)
		if(user) { 
			// add user to res.locals
			res.locals.user = user;
			// go to next middleware
			next();
		} else {
			// flash an error
			req.session.error = 'Incorrect Current Password!';
			// short circuit the route middleware and redirect to /profile
			return res.redirect('/profile');
		}
	},
	changePassword: async (req, res, next) => {
		// destructure new password values from req.body object
		const { 
			newPassword,
			passwordConfirmation
		} = req.body;

		// check if new password values exist
		if (newPassword && passwordConfirmation) {
			// destructure user from res.locals
			const { user } = res.locals;
				// check if new passwords match
				if (newPassword === passwordConfirmation) {
					// set new password on user object
					await user.setPassword(newPassword);
					// go to next middleware
					next();
				} else {
					// flash error
					req.session.error = 'New passwords must match!';
					// short circuit the route middleware and redirect to /profile
					return res.redirect('/profile');
				}
		} else {
			// go to next middleware
			next();
		}
	}
```

## Add updateProfile method to index controller

### File: /controllers/index.js

Add the following code to the top of the file after the existing require() statements:
```JS
const util = require('util');
```

Add the following code after the getProfile method:
```JS
,
	async updateProfile(req, res, next) {
		// destructure username and email from req.body
		const {
			username,
			email
		} = req.body;
		// destructure user object from res.locals
		const { user } = res.locals;
		// check if username or email need to be updated
		if (username) user.username = username;
		if (email) user.email = email;
		// save the updated user to the database
		await user.save();
		// promsify req.login
		const login = util.promisify(req.login.bind(req));
		// log the user back in with new info
		await login(user);
		// redirect to /profile with a success flash message
		req.session.success = 'Profile successfully updated!';
		res.redirect('/profile');
	}
```

## Update Routes

### /routes/index.js

Change:
```JS
const { 
	landingPage,
	getRegister,
	postRegister,
	getLogin,
	postLogin,
	getLogout,
	getProfile
} = require('../controllers');
```
to:
```JS
const { 
	landingPage,
	getRegister,
	postRegister,
	getLogin,
	postLogin,
	getLogout,
	getProfile,
	updateProfile
} = require('../controllers');
```
Change:
```JS
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
```
to:
```JS
const { 
	asyncErrorHandler,
	isLoggedIn,
	isValidPassword,
	changePassword
} = require('../middleware');
```

Change:
```JS
/* PUT /profile/:user_id */
router.put('/profile/:user_id', (req, res, next) => {
  res.send('PUT /profile/:user_id');
});
```
to:
```JS
/* PUT /profile */
router.put('/profile',
	isLoggedIn,
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);
```

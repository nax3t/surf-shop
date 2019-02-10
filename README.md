# User Profile Pt. 1

## Create profile view

### Inside of `/views` create a new file named `profile.ejs`

Add the following code to the profile.ejs view:
```HTML
<% layout('layouts/boilerplate') -%>

<h1><%= user.username %>'s Profile</h1>

<p>Recent posts:</p>

<% posts.forEach(function(post) { %>
<div>
	<a href="/posts/<%= post.id %>"><%= post.title %></a>
</div>
<% }); %>
```

## Update index routes with getProfile method

### File: /routes/index.js

Change:
```JS
const { 
	landingPage,
	getRegister,
	postRegister,
	getLogin,
	postLogin,
	getLogout } = require('../controllers');
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
	getProfile
} = require('../controllers');
```

Change:
```JS
const { asyncErrorHandler } = require('../middleware')
```
to:
```JS
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
```

Change:
```JS
router.get('/profile', (req, res, next) => {
  res.send('GET /profile');
});
```
to:
```JS
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));
```

## Add getProfile method to index controller

### File: /controlers/index.js

Add:
```JS
,
// GET /profile
async getProfile(req, res, next) {
	const { user } = req;
	const posts = await Post.find().where('author').equals(user.id).exec();
	res.render('profile', { user, posts });
}
```
after:
```JS
getLogout(req, res, next) {
  req.logout();
  res.redirect('/');
}
```
final result:
```JS
// GET /logout
getLogout(req, res, next) {
  req.logout();
  res.redirect('/');
},
// GET /profile
async getProfile(req, res, next) {
	const { user } = req;
	const posts = await Post.find().where('author').equals(user.id).exec();
	res.render('profile', { user, posts });
}
```

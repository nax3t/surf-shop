# Continue User Authentication and Authorization Pt3.

## Re-seed the database

### File: /seeds.js

Change:
```JS
      author: {
  '_id' : '5bb27cd1f986d278582aa58c',
  'username' : 'ian'
}
```
to:
```JS
author: '5bb27cd1f986d278582aa58c'
```
*\*your id and username will be different*
### File: /app.js

Uncomment:
```JS
// const seedPosts = require('./seeds');
// seedPosts();
```
in app.js, run the app one time to re-seed the database, then comment it back out.

## Create isAuthor middleware

### File: /middleware/index.js

Add: 
```JS
const Post = require('../models/post');
```
to the top of the file, along with the other existing Review and User model

Add the following middleware after the existing isLoggedIn middleware:
```JS
,
	isAuthor: async (req, res, next) => {
		let post = await Post.findById(req.params.id);
		console.log(post);
		if (post.author.equals(req.user._id)) {
			res.locals.post = post;
			return next();
		}
		req.session.error = 'Access denied!';
		res.redirect('back');
	}
```

### File: /controllers/posts.js

Inside of the postCreate method, right after:
```JS
req.body.post.geometry = response.body.features[0].geometry;
```
add the following: 
```JS
req.body.post.author = req.user._id;
```

Change:
```JS
async postEdit(req, res, next) {
  let post = await Post.findById(req.params.id);
  res.render('posts/edit', { post });
},
```
to:
```JS
postEdit(req, res, next) {
	res.render('posts/edit');
},
```

Change:
```JS
async postUpdate(req, res, next) {
  // find the post by id
  let post = await Post.findById(req.params.id);
```
to:
```JS
async postUpdate(req, res, next) {
	// pull post from res.locals
	const { post } = res.locals;
```

Change:
```JS
async postDestroy(req, res, next) {
  let post = await Post.findById(req.params.id);
```
to:
```JS
async postDestroy(req, res, next) {
	// pull post from res.locals
	const { post } = res.locals;
```

## Add isAuthor middleware to post routes

### File: /routes/posts.js

Change:
```JS
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
```
to:
```JS
const { asyncErrorHandler, isLoggedIn, isAuthor } = require('../middleware');
```

Change:
```JS
router.get('/:id/edit', asyncErrorHandler(postEdit));
```
to:
```JS
router.get('/:id/edit', isLoggedIn, asyncErrorHandler(isAuthor), postEdit);
```

Change:
```JS
router.put('/:id', upload.array('images', 4), asyncErrorHandler(postUpdate));
```
to:
```JS
router.put('/:id', isLoggedIn, asyncErrorHandler(isAuthor), upload.array('images', 4), asyncErrorHandler(postUpdate));
```

Change:
```JS
router.delete('/:id', asyncErrorHandler(postDestroy));
```
to:
```JS
router.delete('/:id', isLoggedIn, asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));
```

## Update GET '/login' route's getLogin method so that logged in users are redirected to the home page

### File: /controllers/index.js

Change:
```JS
getLogin(req, res, next) {
  res.render('login', { title: 'Login' });
},
```
to:
```JS
getLogin(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/');
  res.render('login', { title: 'Login' });
},
```

## Hide edit and delete buttons from users who are not author of post

### File: /views/posts/show.ejs

Change:
```HTML
<div>
	<a href="/posts/<%= post.id %>/edit">
		<button>Edit</button>
	</a>
</div>
<div>
	<form action="/posts/<%= post.id %>?_method=DELETE" method="POST">
		<input type="submit" value="Delete">
	</form>
</div>
```
to:
```HTML
<% if (currentUser && post.author.equals(currentUser._id)) { %>
<div>
	<a href="/posts/<%= post.id %>/edit">
		<button>Edit</button>
	</a>
</div>
<div>
	<form action="/posts/<%= post.id %>?_method=DELETE" method="POST">
		<input type="submit" value="Delete">
	</form>
</div>
<% } %>
```

## Testing it all out

- Log in and create a new post then ensure that you can edit and delete it
- Try to visit edit route for an existing post that you did not create (while logged out and while logged in)
- Try to send delete request a post that you didn't create with curl e.g., `curl -X "DELETE" http://localhost:3000/posts/5c48b91de3c8f61bed99cb76` then check on the post to see if it was deleted
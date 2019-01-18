# Continue User Authentication and Authorization Pt2.

## Remove checkIfUserExists middleware
- Remove checkIfUserExists method (/middleware/index.js)

```JS
,
	checkIfUserExists: async (req, res, next) => {
		let userExists = await User.findOne({'email': req.body.email});
		if(userExists) {
			req.session.error = 'A user with the given email is already registered';
			return res.redirect('back');
		}
		next();
	}
```
- Remove checkIfUserExists (/routes/index.js)

Change:
```JS
const { asyncErrorHandler, checkIfUserExists } = require('../middleware');
```
back to:
```JS
const { asyncErrorHandler } = require('../middleware');
```

Change:
```JS
/* POST /register */
router.post('/register',
	asyncErrorHandler(checkIfUserExists),
	asyncErrorHandler(postRegister)
);
```
back to:
```JS
/* POST /register */
router.post('/register', asyncErrorHandler(postRegister));
```

## Add Authorization Middleware
- Create isLoggedIn check (/middleware/index.js)

(Add it in after the existing middleware methods and don't forget the comma after the method before it)
```JS
,
	isLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) return next();
		req.session.error = 'You need to be logged in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/login');
	}
```
- Bring middleware into post routes (/routes/posts.js)

Change:
```JS
const { asyncErrorHandler } = require('../middleware');
```
to:
```JS
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
```
Change:
```JS
/* GET posts new /posts/new */
router.get('/new', postNew);

/* POST posts create /posts */
router.post('/', upload.array('images', 4), asyncErrorHandler(postCreate));
```
to:
```JS
/* GET posts new /posts/new */
router.get('/new', isLoggedIn, postNew);

/* POST posts create /posts */
router.post('/', isLoggedIn, upload.array('images', 4), asyncErrorHandler(postCreate));
```

### Update Register and Login Methods
- Update postRegister method (/controllers/index.js)

Change:
```JS
// GET /register
getRegister(req, res, next) {
	res.render('register', { title: 'Register' });
},
```
to:
```JS
// GET /register
getRegister(req, res, next) {
	res.render('register', { title: 'Register', username: '', email: '' });
},
```

Change:
```JS
// POST /register
async postRegister(req, res, next) {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		image: req.body.image
	});

	let user = await User.register(newUser, req.body.password);
	req.login(user, function(err) {
		if (err) return next(err);
		req.session.success = `Welcome to Surf Shop, ${user.username}!`;
		res.redirect('/');
	});
},
```
to:
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
		res.render('register', { title: 'Register', username, email, error })
	}
},
```
- Update postLogin method (/controllers/index.js)

Change:
```JS
// POST /login
postLogin(req, res, next) {
	passport.authenticate('local', {
	  successRedirect: '/',
	  failureRedirect: '/login' 
	})(req, res, next);
},
```
to:
```JS
// POST /login
async postLogin(req, res, next) {
	const { username, password } = req.body;
	const { user, error } = await User.authenticate()(username, password);
	if(!user && error) {
		return next(error);
	}
	req.login(user, function(err) {
		if (err) return next(err);
		req.session.success = `Welcome back, ${username}!`;
		const redirectUrl = req.session.redirectTo || '/';
		delete req.session.redirectTo;
		res.redirect(redirectUrl);
	});
},
```

### Update Index (auth) Routes

- Update login POST route (/routes/index.js)

Change:
```JS
/* POST /login */
router.post('/login', postLogin);
```
to:
```JS
/* POST /login */
router.post('/login', asyncErrorHandler(postLogin));
```

### Update Register View
- Update the username and email inputs (/views/register.ejs)

Change:
```JS
<input type="text" id="username" name="username" placeholder="username" required>
```
to:
```JS
<input type="text" id="username" name="username" placeholder="username" value="<%= username %>" required>
```

Change:
```JS
<input type="email" id="email" name="email" placeholder="email" required>
```
to:
```JS
<input type="email" id="email" name="email" placeholder="email" value="<%= email %>" required>
```

### Fix Not Found Error with Favicon
- Add a favicon.ico file to the /public directory (download from [here](https://cdn.discordapp.com/attachments/466639921201938446/530956610760343563/favicon.ico))
- Uncomment the following line in /app.js (and remove the comment before it, if you like)
```JS
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
```

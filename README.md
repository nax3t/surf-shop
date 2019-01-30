# Housekeeping - Bug Fixes and Updates

## Update npm

Run `npm install npm@latest -g` in the terminal

## Update npm packages
- Run `npm install -g npm-check-updates` in the terminal, from root folder of project
- Now run `ncu --upgradeAll ` (same terminal window)
- Finally, run `npm update` (same terminal window)

## Update mongoose.connect()

### File: /app.js

Change:
```JS
mongoose.connect('mongodb://localhost:27017/surf-shop', { useNewUrlParser: true });
```
to:
```JS
mongoose.connect('mongodb://localhost:27017/surf-shop', {
	useNewUrlParser: true,
	useCreateIndex: true
});
```

## Remove body-parser

### File: /app.js

Run `npm uninstall body-parser` in the terminal, from root folder of project

Remove:
```JS
const bodyParser = require('body-parser');
```

Change:
```JS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

to:
```JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## Remove async from postEdit method

### File: /controllers/posts.js

Change:
```JS
async postEdit(req, res, next) {
	res.render('posts/edit');
},
```

to:
```JS
postEdit(req, res, next) {
	res.render('posts/edit');
},
```

### File: /routes/posts.js

Change:
```JS
router.get('/:id/edit', isLoggedIn, asyncErrorHandler(isAuthor), asyncErrorHandler(postEdit));
```
to:
```JS
router.get('/:id/edit', isLoggedIn, asyncErrorHandler(isAuthor), postEdit);
```

## Change price input to number type

### File: /views/posts/new.ejs

Change:
```HTML
<input type="text" name="post[price]" placeholder="Price">
```
to:
```HTML
<input type="number" name="post[price]" placeholder="Price">
```

### File: /views/posts/edit.ejs

Change:
```HTML
<input type="text" name="post[price]" placeholder="Price" value="<%= post.price  %>">
```
to:
```HTML
<input type="number" name="post[price]" placeholder="Price" value="<%= post.price  %>">
```


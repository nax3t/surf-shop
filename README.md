# Search and Filter

## Important note, please read:
I'm using a new format for the follow along. It will resemble what you see when using a [git diff](https://git-scm.com/docs/git-diff) command.

For example,
```DIFF
const leaveMeAlone = require('leave-me-alone');
-const removeMe = require('remove-me');
+const addMe = require('add-me');
```
The above example means you should find the first line in your code, then remove the line with the minus - sign before it and add the line with the plus + sign before it.

If you have any questions about this new format, please ask them in the [course Discord server](https://discord.gg/QH4qbW7)

## Summary of added (A) and modified (M) files:

- (M) models/post.js
- (M) seeds.js
- (M) views/layouts/boilerplate.ejs
- (M) views/partials/paginatePosts.ejs
- (A) views/partials/searchFilter.ejs
- (M) views/posts/index.ejs
- (M) controllers/posts.js
- (M) middleware/index.js
- (M) routes/posts.js
- (A) public/javascripts/post-index.js

## Models

### File: /models/post.js

```DIFF
 PostSchema.plugin(mongoosePaginate);
 
+PostSchema.index({ geometry: '2dsphere' });

 module.exports = mongoose.model('Post', PostSchema);
````

## Seeds

### File: /seeds.js

```DIFF
async function seedPosts() {
-	await Post.remove({});
+	await Post.deleteMany({});
	for(const i of new Array(600)) {
		const random1000 = Math.floor(Math.random() * 1000);
+		const random5 = Math.floor(Math.random() * 6);
		const title = faker.lorem.word();
		const description = faker.lorem.text();
		const postData = {
			title,
			description,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
+			price: random1000,
+			avgRating: random5,
			author: '5bb27cd1f986d278582aa58c'
		}
		let post = new Post(postData);
		post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
		post.save();
	}
	console.log('600 new posts created');
}
````

Now go to /app.js and uncomment the following lines:
```JS
// const seedPosts = require('./seeds');
// seedPosts();
```
Save the file and run the server one time with `node app.js`, then comment those lines back out.

## Views

### File: views/layouts/boilerplate.ejs

```DIFF
<!DOCTYPE html>
<html>
 <head>
   <title><%= title %></title>
+  <!-- Include BS4 CDN for development purposes -->
+  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
   <link rel='stylesheet' href='/stylesheets/style.css' />
   <link rel='stylesheet' href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.css' type='text/css' />
   <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css' rel='stylesheet' />
   <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.js'></script>
   <script src='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.min.js'></script>
 </head>
 <body>
 	<% include ../partials/navbar %>
 	<% include ../partials/flash-messages %>
 	<%- body -%>
 </body>
+<script src="/javascripts/post-index.js"></script>
</html> 
```

### File: views/partials/paginatePosts.ejs

```DIFF
 <div style="margin: 20px 0;">
 <% if(posts.page - 1) { %>
-       <a href="/posts?page=<%= posts.page - 1 %>">Prev</a>
+       <a href="/posts?page=<%= posts.page - 1 %><%= queryString %>">Prev</a>
 <% } %>
+<% if(posts.pages > 1 && posts.docs.length) { %>
 <% for(let i = 1; i <= posts.pages; i++) { %>
-       <a href="/posts?page=<%= i %>"
+       <a href="/posts?page=<%= i %><%= queryString %>"
                 <%= i === posts.page ? 'style=color:#000;' : '' %>
                ><%= i %></a>
 <% } %>
+<% } %>
 <% if((posts.page + 1) <= posts.pages) { %>
-       <a href="/posts?page=<%= posts.page + 1 %>">Next</a>
+       <a href="/posts?page=<%= posts.page + 1 %><%= queryString %>">Next</a>
 <% } %>
 </div>
```

### File: views/partials/searchFilter.ejs

Create a new file in /views/partials and name it searchFilter.ejs then add the following markup:

```HTML
<form action="/posts" method="GET">
	<fieldset>
		<legend>Search</legend>
		<label for="search">Search</label>
		<input type="text" placeholder="Search" name="search" id="seach" value="<%= query.search %>">
	</fieldset>

	<fieldset>
	<div>
  	<label for="location">Location</label>
  	<input type="text" id="location" name="location" placeholder="Address or Zipcode" value="<%= query.location %>">
  	<small><a href="#" id="use-my-location">use my location</a></small>
  </div>
		<legend>Distance (miles)</legend>
  	<div>
	    <input type="radio" name="distance" id="distance25" value="25" <%= query.distance === '25' ? 'checked' : '' %>>
  	  <label for="distance25">25</label>
  	</div>
  	<div>
	    <input type="radio" name="distance" id="distance50" value="50" <%= query.distance === '50' ? 'checked' : '' %>>
  	  <label for="distance50">50</label>
  	</div>
  	<div>
	    <input type="radio" name="distance" id="distance100" value="100" <%= query.distance === '100' ? 'checked' : '' %>>
		  <label for="distance100">100</label>
  	</div>
  	<div>
  		<a href="#" id="clear-distance">clear</a>
  	</div>
	</fieldset>

	<fieldset>
		<legend>Price</legend>
		<label for="min">Min</label>
		<input type="number" id="min" name="price[min]" min="0" max="10000" step="1" placeholder="Min" value="<%= query.price.min %>">

		<label for="max">Max</label>
		<input type="number" id="max" name="price[max]" min="0" max="10000" step="1" step="1" placeholder="Max" value="<%= query.price.max %>">
	</fieldset>

	<fieldset>
		<legend>Rating</legend>
		<input type="checkbox" id="zero-stars" name="avgRating[]" value="0" <%= query.avgRating.includes('0') ? 'checked' : '' %>>
		<label for="zero-stars">0 stars</label><br>
		<input type="checkbox" id="one-star" name="avgRating[]" value="1" <%= query.avgRating.includes('1') ? 'checked' : '' %>>
		<label for="one-star">1 star</label><br>
		<input type="checkbox" id="two-stars" name="avgRating[]" value="2" <%= query.avgRating.includes('2') ? 'checked' : '' %>>
		<label for="two-stars">2 stars</label><br>
		<input type="checkbox" id="three-stars" name="avgRating[]" value="3" <%= query.avgRating.includes('3') ? 'checked' : '' %>>
		<label for="three-stars">3 stars</label><br>
		<input type="checkbox" id="four-stars" name="avgRating[]" value="4" <%= query.avgRating.includes('4') ? 'checked' : '' %>>
		<label for="four-stars">4 stars</label><br>
		<input type="checkbox" id="five-stars" name="avgRating[]" value="5" <%= query.avgRating.includes('5') ? 'checked' : '' %>>
		<label for="five-stars">5 stars</label>
	</fieldset>
	<div>
		<a href="/posts">clear all</a>
	</div>
	
	<input type="submit">
</form>
```

### File: views/posts/index.ejs

```DIFF
 <% layout('layouts/boilerplate') -%>
 <h1>Posts Index!</h1>
-<div id="map"></div>

+<div class="container-fluid">
+       <div class="row">
+               <div class="col-4">
+                       <% include ../partials/searchFilter %>
+               </div>
+               <div class="col-8">
+                       <div id="map"></div>
+               </div>
+       </div>
+</div>
 
 <% include ../partials/paginatePosts %>
```

## Controllers

### File: /controllers/posts.js

```DIFF
// Posts Index
async postIndex(req, res, next) {
-	let posts = await Post.paginate({}, {
+	const { dbQuery } = res.locals;
+	delete res.locals.dbQuery;
+	let posts = await Post.paginate(dbQuery, {
		page: req.query.page || 1,
		limit: 10,
		sort: '-_id'
	});
	posts.page = Number(posts.page);
+	if (!posts.docs.length && res.locals.query) {
+		res.locals.error = 'No results match that query.';
+	}
	res.render('posts/index', { 
		posts, 
		mapBoxToken, 
		title: 'Posts Index'
	});
},
```

```DIFF
// Posts Show
async postShow(req, res, next) {
	let post = await Post.findById(req.params.id).populate({
		path: 'reviews',
		options: { sort: { '_id': -1 } },
		populate: {
			path: 'author',
			model: 'User'
		}
	});
-	const floorRating = post.calculateAvgRating();
+	// const floorRating = post.calculateAvgRating();
+	const floorRating = post.avgRating;
	res.render('posts/show', { post, mapBoxToken, floorRating });
},
```

## Middleware

### File: /middleware/index.js

```DIFF
 const Review = require('../models/review');
 const User = require('../models/user');
 const Post = require('../models/post');
 const { cloudinary } = require('../cloudinary');
+const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
+const mapBoxToken = process.env.MAPBOX_TOKEN;
+const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });
+
+function escapeRegExp(str) {
+  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
+}
```
Add a new async method to the bottom of module.exports and name it searchAndFilterPosts, then add the following code:

```JS
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
``` 

*\*Don't forget the comma after the deleteProfileImage method*

## Routes

### File: /routes/posts.js

```DIFF
 const router = express.Router();
 const multer = require('multer');
 const { storage } = require('../cloudinary');
 const upload = multer({ storage });
-const { asyncErrorHandler, isLoggedIn, isAuthor } = require('../middleware');
+const { asyncErrorHandler, isLoggedIn, isAuthor, searchAndFilterPosts } = require('../middleware');
```

```DIFF
 /* GET posts index /posts */
-router.get('/', asyncErrorHandler(postIndex));
+router.get('/', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(postIndex));
```

## Public

### File: /public/javascripts/post-index.js

Create a new file inside of /public/javascripts and name it post-index.js then add the following code:

```JS
const clear = document.getElementById('clear-distance');
clear.addEventListener('click', (e) => {
       e.preventDefault();
       document.getElementById('location').value = '';
       document.querySelector('input[type=radio]:checked').checked = false;
});
```


# Add average rating to Post
- Add avgRating property to PostSchema (/models/post.js)
```JS
const PostSchema = new Schema({
	title: String,
	price: String,
	description: String,
	images: [ { url: String, public_id: String } ],
	location: String,
	coordinates: Array,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	],
	avgRating: { type: Number, default: 0 }
});
```
- Add calculateAvgRating instance method to PostSchema (/models/post.js)
```JS
PostSchema.methods.calculateAvgRating = function() {
	let ratingsTotal = 0;
	this.reviews.forEach(review => {
		ratingsTotal += review.rating;
	});
	this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
	const floorRating = Math.floor(this.avgRating);
	this.save();
	return floorRating;
}
```
- Calculate average rating in postShow method (/controllers/posts.js)
```JS
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
	const floorRating = post.calculateAvgRating();
	// the following line is not covered in a lecture
	let mapBoxToken = process.env.MAPBOX_TOKEN;
	res.render('posts/show', { post, mapBoxToken, floorRating });
},
```
- Add font-awesome CDN to post show layout (/views/layouts/post-show-layout.ejs)
```HTML
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
```
- Add star rendering logic to post show view (/views/posts/show.ejs)
```HTML
<div>
<% for(var i = 0; i < 5; i++) { %>
	<% if(i < floorRating) { %>
    <i class="fas fa-star"></i>
  <% } else if((post.avgRating - i) > 0 && (post.avgRating - i) < 1) { %>
	  <i class="fas fa-star-half-alt"></i>
	<% } else { %>
    <i class="far fa-star"></i>
	<% } %>
<% } %>
<%= `${post.avgRating} star${post.avgRating === 1 ? '' : 's'}` %>
</div>
```
# Seed database
- Add Review model, remove all reviews, and add coordinates to post in seeds.js (/seeds.js)
```JS
const faker = require('faker');
const Post = require('./models/post');

async function seedPosts() {
	await Post.remove({});

	for(const i of new Array(40)) {
		const post = {
			title: faker.lorem.word(),
			description: faker.lorem.text(),
			coordinates: [-122.0842499, 37.4224764],
			author: {
		    '_id' : '5bb27cd1f986d278582aa58c',
		    'username' : 'ian'
		  }
		}
		await Post.create(post);
	}
	console.log('40 new posts created');
}

module.exports = seedPosts;
```
- Uncomment seedPosts function in app.js, save the file with nodemon running, then comment it back out (/app.js)
```JS
// const seedPosts = require('./seeds');
// seedPosts();
```
# Test it out
- Add an extra user to the database so we have three to make reviews with (run in terminal with server running separately)
`curl -d "username=ian3&password=password" -X POST http://localhost:3000/register` 

- Find all users in database using mongo shell
```
mongo
use surf-shop
db.users.find().pretty();
```
- Create a comment using each user's id in your app.js middleware (/app.js)
```
// set local variables middleware
app.use(function(req, res, next) {
  req.user = {
    '_id' : '5bb27cd1f986d278582aa58c', // <--- Replace this id to use each user
    'username' : 'ian'
  }
```

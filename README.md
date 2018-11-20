# Add Pagination to Posts Index

- Seed some post data
	- Install faker
	`npm i -S faker`
	- Create a seeds.js file in the root directory /surf-shop and open it
	- Require faker
	`const faker = require('faker');`
	- Require Post model
	`const Post = require('./models/post');`
	- Write an async function that removes existing posts and runs a loop that generates 40 posts
	```JS
	async function seedPosts() {
		await Post.remove({});
		for(const i of new Array(40)) {
				const post = {		
					title: faker.lorem.word(),
					description: faker.lorem.text(),
					author: {
				    '_id' : '5bb27cd1f986d278582aa58c',
				    'username' : 'ian'
					}
				}
				await Post.create(post);
		}
		console.log('40 new posts created');
	}
	```
	- Export the function
	`module.exports = seedPosts;`
	- Require the seedPosts function and invoke it in app.js
	```JS
	const seedPosts = require('./seeds');
	seedPosts();
	```
- Install mongoose-paginate
	`npm i -S mongoose-paginate`
- Add mongoose-paginate to Post model
	```JS
	const mongoosePaginate = require('mongoose-paginate');
	...
	PostSchema.plugin(mongoosePaginate);
	```
- Update postIndex method in /controllers/posts.js to include pagination in query
	```JS
	// Posts Index
	async postIndex(req, res, next) {
		let posts = await Post.paginate({}, {
			page: req.query.page || 1,
			limit: 10
		});
		posts.page = Number(posts.page);
		res.render('posts/index', { posts, title: 'Posts Index' });
	},
	```
- Update loop over posts in /views/posts/index.ejs so that it loops over posts.docs now
	```JS
	<% posts.docs.forEach(function(post) { %>
	```
- Create a paginatePosts.ejs partial in /views/partials
	```HTML
	<div style="margin: 20px 0">
	<% if(posts.page - 1) { %>
		<a href="/posts?page=<%= posts.page - 1 %>">Prev</a>
	<% } %>
	<% for(let i = 1; i <= posts.pages; i++) { %>
		<a href="/posts?page=<%= i %>" <%= i === posts.page ? 'style=color:#000' : '' %>><%= i %></a>
	<% } %>
	<% if((posts.page + 1) <= posts.pages) { %>
		<a href="/posts?page=<%= posts.page + 1 %>">Next</a>
	<% } %>
	</div>
	```
- Include the partial in your /views/posts/index.ejs view (I include it twice, once above the posts loop and once below)
	`<% include ../partials/paginatePosts %>`


# Update Posts Controller for New Cluster Maps Feature

## /controllers/posts.js
- Inside postCreate method, change: 
```JS
req.body.post.coordinates = response.body.features[0].geometry.coordinates;
let post = await Post.create(req.body.post);
```
to:
```JS
req.body.post.geometry = response.body.features[0].geometry;
let post = await new Post(req.body.post);
post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`
post.save();
```
and change:
```JS
let posts = await Post.paginate({}, {
	page: req.query.page || 1,
	limit: 10
});
```
to:
```JS
let posts = await Post.paginate({}, {
	page: req.query.page || 1,
	limit: 10,
	sort: '-_id'
});
```
- Inside postUpdate method, change: 
`post.coordinates = response.body.features[0].geometry.coordinates;` 
to: 
`post.geometry = response.body.features[0].geometry;`
then add: 
```JS
post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
```
right after `post.price = req.body.post.price;`
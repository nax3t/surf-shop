const Post = require('../models/post');

module.exports = {
	// Posts Index
	async getPosts(req, res, next) {
		let posts = await Post.find({});
		res.render('posts/index', { posts });
	},
	// Posts New
	newPost(req, res, next) {
		res.render('posts/new');
	}
}
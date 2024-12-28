const { faker } = require('@faker-js/faker');
const Post = require('./models/post');
const cities = require('./cities');

async function seedPosts() {
	try {
		await Post.deleteMany({});
		
		const posts = Array.from({ length: 600 }, () => {
			const random1000 = Math.floor(Math.random() * 1000);
			const random5 = Math.floor(Math.random() * 6);
			const title = faker.lorem.word();
			const description = faker.lorem.text();
			
			const post = new Post({
				title,
				description,
				location: `${cities[random1000].city}, ${cities[random1000].state}`,
				geometry: {
					type: 'Point',
					coordinates: [cities[random1000].longitude, cities[random1000].latitude],
				},
				price: random1000,
				avgRating: random5,
				author: '5bb27cd1f986d278582aa58c',
				images: [
					{
						url: 'https://res.cloudinary.com/devsprout/image/upload/v1735357997/surf-shop/surfboarde5b254dc6341a0b35cfde3b845cd8bc5.jpg'
					}
				]
			});
			
			post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
			return post.save();
		});
		
		await Promise.all(posts);
		console.log('600 new posts created');
	} catch (err) {
		console.error('Error seeding posts:', err);
	}
}

module.exports = seedPosts;

// Run the seed function if this script is run directly
if (require.main === module) {
	const mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost:27017/surf-shop')
	.then(() => {
		console.log('Connected to MongoDB');
		return seedPosts();
	})
	.then(() => {
		mongoose.connection.close();
		console.log('Database connection closed');
	})
	.catch(err => {
		console.error('Error:', err);
		mongoose.connection.close();
	});
}
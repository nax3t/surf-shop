# Remove Local Image Storage

## Delete /uploads directory from app's root directory
- Navigate to root directory of surf-shop app in your terminal and run `rm -rf ./uploads`

## Install multer-storage-cloudinary
- `npm i -S multer-storage-cloudinary`

## Configure Cloudinary and Storage
- Create a folder named `cloudinary` in the app's root directory
- Create an `index.js` file inside of the new /cloudinary directory
- Add the following code to the /cloudinary/index.js file and save it:
```JS
const crypto = require('crypto');
const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'YOUR-CLOUD-NAME-HERE',
	api_key: 'YOUR-API-KEY-HERE',
	api_secret: process.env.CLOUDINARY_SECRET
});
const cloudinaryStorage = require('multer-storage-cloudinary');
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'surf-shop',
  allowedFormats: ['jpeg', 'jpg', 'png'],
  filename: function (req, file, cb) {
  	let buf = crypto.randomBytes(16);
  	buf = buf.toString('hex');
  	let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/ig, '');
  	uniqFileName += buf;
    cb(undefined, uniqFileName );
  }
});

module.exports = {
	cloudinary,
	storage
}
```
- Be sure to change cloud_name and api_key values (they're currently located in your `/controllers/posts.js` file)

## Update /routes/posts.js
- Remove: `const upload = multer({'dest': 'uploads/'});`
- Add: `const { cloudinary, storage } = require('../cloudinary');`
- Add: `const upload = multer({ storage });`

## /controllers/posts.js
- Remove: 
```JS
const cloudinary = require('cloudinary');
cloudinary.config({
      cloud_name: 'devsprout',
      api_key: '111963319915549',
      api_secret: process.env.CLOUDINARY_SECRET
});
```
- Add: `const { cloudinary } = require('../cloudinary');`
- Inside both the `postCreate` and `postUpdate` methods, change:
```JS
for(const file of req.files) {
	let image = await cloudinary.v2.uploader.upload(file.path);
	req.body.post.images.push({
		url: image.secure_url,
		public_id: image.public_id
	});
}
```
to:
```JS
for(const file of req.files) {
	req.body.post.images.push({
		url: file.secure_url,
		public_id: file.public_id
	});
}
```

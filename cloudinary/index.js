const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET
});
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'surf-shop',
    format: (req, file) => file.mimetype.split('/')[1],
    public_id: (req, file) => {
      const buf = crypto.randomBytes(16).toString('hex');
      const uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/ig, '');
      return uniqFileName + buf;
    }
  }
});

module.exports = {
	cloudinary,
	storage
}
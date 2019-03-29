const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: { type: String, unique: true, required: true },
	image:  {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

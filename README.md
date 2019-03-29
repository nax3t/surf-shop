# Forgot Password / Reset

## Important note, please read:
I'm using a new format for some of the code snippets. It will resemble what you see when using a `git diff` command.

For example,
```JS
const leaveMeAlone = require('leave-me-alone');
-const removeMe = require('remove-me');
+const addMe = require('add-me');
```
The above example means you should find the first line in your code, then remove the line with the minus - sign before it and add the line with the plus + sign before it.

If you have any questions about this new format, please ask them in the [course Discord server](https://discord.gg/QH4qbW7)

## Sign up for SendGrid

- Visit: [https://signup.sendgrid.com/](https://signup.sendgrid.com/) and create a free Trial 40k account
- Verify your account by email
- Copy your API key and add it to your .env file as SENDGRID_API_KEY

## Install the @sendgrid/mail and crypto npm packages

- `npm i @sendgrid/mail crypto` 
	- *(check to be sure you are using npm version 5 or newer, otherwise include the -S flag e.g., `npm i -S @sendgrid/mail crypto`)*

## Models

### Update /models/user.js

Change:
```JS
const UserSchema = new Schema({
	email: { type: String, unique: true, required: true },
	image:  {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
	}
});
```
to:
```JS
const UserSchema = new Schema({
	email: { type: String, unique: true, required: true },
	image:  {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});
```

## Views

Create a new folder inside of `/views` named `/users`

Create two new view files inside of `/views/users` and name them `forgot.ejs` and `reset.ejs`

### File: /views/users/forgot.ejs

Add the following markup:
```HTML
<% layout('layouts/boilerplate') -%>

<h1>Forgot Password</h1>

<form action="/forgot-password?_method=PUT" method="POST">
	<div>
		<label for="email">Email</label>
		<input type="email" id="email" name="email" autofocus>
	</div>
	<div>
		<input type="submit" value="Reset Password">
	</div>
</form>
```

### File: /views/users/reset.ejs

Add the following markup:
```HTML
<% layout('layouts/boilerplate') -%>

<h1>Reset Password</h1>

<form action="/reset/<%= token %>?_method=PUT" method="POST">
  <div>
    <label for="password">New Password</label>
    <input type="password" name="password" id="password" placeholder="New password" autofocus>
  </div>
  <div>
    <label for="confirm">Confirm Password</label>
    <input type="password" name="confirm" id="confirm" placeholder="Confirm password">
  </div>
  <div>
    <input type="submit" value="Update Password">
  </div>
</form>
```

### File: /views/login.ejs

Add the following markup to the bottom of the file, after the existing form element:
```HTML
<div>
	<a href="/forgot-password">Forgot password?</a>
</div>
```


## Controllers

### File: /controllers/index.js

```JS
const mapBoxToken = process.env.MAPBOX_TOKEN;
const util = require('util');
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
+const crypto = require('crypto');
+const sgMail = require('@sendgrid/mail');
+sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```
---
Add the following after the updateProfile method *(don't forget comma after updateProfile closing bracket)*
```JS
getForgotPw(req, res, next) {
	res.render('users/forgot');
},
async putForgotPw(req, res, next) {
	const token = await crypto.randomBytes(20).toString('hex');
	
	const user = await User.findOne({ email: req.body.email })
	if (!user) {
		req.session.error = 'No account with that email address exists.';
	  return res.redirect('/forgot-password');
	}

	user.resetPasswordToken = token;
	user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();
  

  const msg = {
    to: user.email,
    from: 'Surf Shop Admin <your@email.com>',
    subject: 'Surf Shop - Forgot Password / Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/				/g, ''),
  };

  await sgMail.send(msg);

  req.session.success = `An e-mail has been sent to ${user.email} with further instructions.`;
  res.redirect('/forgot-password');
},
async getReset(req, res, next) {
  const { token } = req.params;
	const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
  if (!user) {
    req.session.error = 'Password reset token is invalid or has expired.';
    return res.redirect('/forgot-password');
  }
  res.render('users/reset', { token });
},
async putReset(req, res, next) {
	const { token } = req.params;
	const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
	
	if (!user) {
	 req.session.error = 'Password reset token is invalid or has expired.';
	 return res.redirect(`/reset/${ token }`);
	}

	if(req.body.password === req.body.confirm) {
		await user.setPassword(req.body.password);
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		await user.save();
		const login = util.promisify(req.login.bind(req));
		await login(user);
	} else {
		req.session.error = 'Passwords do not match.';
		return res.redirect(`/reset/${ token }`);
	}

  const msg = {
    to: user.email,
    from: 'Surf Shop Admin <your@email.com>',
    subject: 'Surf Shop - Password Changed',
    text: `Hello,
	  	This email is to confirm that the password for your account has just been changed.
	  	If you did not make this change, please hit reply and notify us at once.`.replace(/		  	/g, '')
  };
  
  await sgMail.send(msg);

  req.session.success = 'Password successfully updated!';
  res.redirect('/');
}
```

## Routes

### File: /routes/index.js

```JS
const {
        postLogin,
        getLogout,
        getProfile,
-       updateProfile
+       updateProfile,
+       getForgotPw,
+       putForgotPw,
+       getReset,
+       putReset
 } = require('../controllers');

```
---
```JS
 /* GET /forgot */
-router.get('/forgot', (req, res, next) => {
-  res.send('GET /forgot');
-});
+router.get('/forgot-password', getForgotPw);
 
 /* PUT /forgot */
-router.put('/forgot', (req, res, next) => {
-  res.send('PUT /forgot');
-});
+router.put('/forgot-password', asyncErrorHandler(putForgotPw));
 
 /* GET /reset/:token */
-router.get('/reset/:token', (req, res, next) => {
-  res.send('GET /reset/:token');
-});
+router.get('/reset/:token', asyncErrorHandler(getReset));
 
 /* PUT /reset/:token */
-router.put('/reset/:token', (req, res, next) => {
-  res.send('PUT /reset/:token');
-});
+router.put('/reset/:token', asyncErrorHandler(putReset));
```

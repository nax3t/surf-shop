# User Profile Pt. 5 - Refactor

## Update profile.ejs view

### File: /views/profile.ejs

Change:
```HTML
<form action="/profile?_method=PUT" method="POST" id="update-profile">
```
to: *You may not have the id, if you skipped that step per the video note*
```HTML
<form action="/profile?_method=PUT" method="POST">
```

Change:
```HTML
<input type="submit">
```
to:
```HTML
<input type="submit" id="update-profile">
```
## Update profile.js script

### File: /public/javascripts/profile.js

Change:
```JS
let newPasswordValue;
let confirmationValue;
const form = document.querySelector('form');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message');
function validatePasswords(message, add, remove) {
		validationMessage.textContent = message;
		validationMessage.classList.add(add);
		validationMessage.classList.remove(remove);
}
confirmation.addEventListener('input', e => {
	e.preventDefault();
	newPasswordValue = newPassword.value;
	confirmationValue = confirmation.value;
	if (newPasswordValue !== confirmationValue) {
	  validatePasswords('Passwords must match!', 'color-red', 'color-green');
	} else {
		validatePasswords('Passwords match!', 'color-green', 'color-red');
	}
});

form.addEventListener('submit', e => {
	if (newPasswordValue !== confirmationValue) { 
		e.preventDefault();
		const error = document.getElementById('error');
		if(!error) {
			const flashErrorH1 = document.createElement('h1');
			flashErrorH1.classList.add('color-red');
			flashErrorH1.setAttribute('id', 'error');
			flashErrorH1.textContent = 'Passwords must match!';
			const navbar = document.getElementById('navbar');
			navbar.parentNode.insertBefore(flashErrorH1, navbar.nextSibling);
		}
	}
});
```
to:
```JS
let newPasswordValue;
let confirmationValue;
const submitBtn = document.getElementById('update-profile');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message');
function validatePasswords(message, add, remove) {
		validationMessage.textContent = message;
		validationMessage.classList.add(add);
		validationMessage.classList.remove(remove);
}
confirmation.addEventListener('input', e => {
	newPasswordValue = newPassword.value;
	confirmationValue = confirmation.value;
	if (newPasswordValue !== confirmationValue) {
	  validatePasswords('Passwords must match!', 'color-red', 'color-green');
	  submitBtn.setAttribute('disabled', true);
	} else {
		validatePasswords('Passwords match!', 'color-green', 'color-red');
	  submitBtn.removeAttribute('disabled');
	}
});
```

## Update changePassword method in middleware

### File: /middleware/index.js
Change:
```JS
changePassword: async (req, res, next) => {
	const {
		newPassword,
		passwordConfirmation
	} = req.body;

	if (newPassword && passwordConfirmation) {
		const { user } = res.locals;
		if (newPassword === passwordConfirmation) {
			await user.setPassword(newPassword);
			next();
		} else {
			req.session.error = 'New passwords must match!';
			return res.redirect('/profile');
		}
	} else {
		next();
	}
}
```
to:
```JS
changePassword: async (req, res, next) => {
	const {
		newPassword,
		passwordConfirmation
	} = req.body;
	
	if (newPassword && !passwordConfirmation) {
		req.session.error = 'Missing password confirmation!';
		return res.redirect('/profile');
	} else if (newPassword && passwordConfirmation) {
		const { user } = res.locals;
		if (newPassword === passwordConfirmation) {
			await user.setPassword(newPassword);
			next();
		} else {
			req.session.error = 'New passwords must match!';
			return res.redirect('/profile');
		}
	} else {
		next();
	}
}
```

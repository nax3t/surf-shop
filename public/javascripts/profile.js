const form = {
	submitButton: document.getElementById('update-profile'),
	newPasswordField: document.getElementById('new-password'),
	confirmPasswordField: document.getElementById('password-confirmation'),
	validationMessageElement: document.getElementById('validation-message')
};

function updateValidationUI(message, isValid) {
	form.validationMessageElement.textContent = message;
	form.validationMessageElement.classList.add(isValid ? 'color-green' : 'color-red');
	form.validationMessageElement.classList.remove(isValid ? 'color-red' : 'color-green');
	const isNotValid = (isValid === false);
	form.submitButton.disabled = isNotValid;
}

function checkPasswordsMatch() {
	const newPassword = form.newPasswordField.value;
	const confirmPassword = form.confirmPasswordField.value;
	
	if (!newPassword && !confirmPassword) {
		form.validationMessageElement.textContent = '';
		form.submitButton.disabled = false;
		return;
	}
	
	const passwordsMatch = newPassword === confirmPassword;
	const message = passwordsMatch ? 'Passwords match!' : 'Passwords must match!';
	updateValidationUI(message, passwordsMatch);
}

form.newPasswordField.addEventListener('change', event => {
	const confirmationRequired = Boolean(event.target.value);
	form.confirmPasswordField.required = confirmationRequired;
});

form.newPasswordField.addEventListener('input', event => {
	event.preventDefault();
	checkPasswordsMatch();
});

form.confirmPasswordField.addEventListener('input', event => {
	event.preventDefault();
	checkPasswordsMatch();
});
function geoFindMe(e) {
	e.preventDefault();

	const status = document.querySelector('#status');
	const locationInput = document.querySelector('#location');

	function success(position) {
		const longitude = position.coords.longitude;
		const latitude = position.coords.latitude;

		// status.textContent = '';
		status.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
		locationInput.value = `[${longitude}, ${latitude}]`;
	}

	function error() {
		status.textContent = 'Unable to retrieve your location';
	}

	if (!navigator.geolocation) {
		status.textContent = 'Geolocation is not supported in your browser';
	} else {
		status.textContent = 'Locating...';
		navigator.geolocation.getCurrentPosition(success, error);
	}
}

document.querySelector('#find-me').addEventListener('click', geoFindMe);







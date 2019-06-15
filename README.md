# Use My Location (HTML5 Geocoding API)

## Important note, please read:
I'm using a new format for the follow along. It will resemble what you see when using a [git diff](https://git-scm.com/docs/git-diff) command.

For example,
```DIFF
const leaveMeAlone = require('leave-me-alone');
-const removeMe = require('remove-me');
+const addMe = require('add-me');
```
The above example means you should find the first line in your code, then remove the line with the minus - sign before it and add the line with the plus + sign before it.

If you have any questions about this new format, please ask them in the [course Discord server](https://discord.gg/QH4qbW7)

## Summary of added (A) and modified (M) files:

- (M) views/partials/searchFilter.ejs
- (M) middleware/index.js
- (A) public/javascripts/use-my-location.js

## Views

### File: views/partials/searchFilter.ejs

```DIFF
<div>
	<label for="location">Location</label>
	<input type="text" id="location" name="location" value="<%= query.location %>" placeholder="Address or Zipcode">
-	<small><a href="#">use my location</a></small>
+	<small><a href="#" id="find-me">use my location</a></small><br/>
+	<p id="status"></p>
</div>
```
------
and at the bottom of the same file...
------
```DIFF
</form>

+	<script src="/javascripts/use-my-location.js"></script>
```

## Middleware

### File: /middleware/index.js

```DIFF
if (location) {
-	const response = await geocodingClient
-	  .forwardGeocode({
-	    query: location,
-	    limit: 1
-	  })
-	  .send();
-	const { coordinates } = response.body.features[0].geometry;
+	let coordinates;
+	try {
+		location = JSON.parse(location);
+		coordinates = location;
+	} catch(err) {
+		const response = await geocodingClient
+			.forwardGeocode({
+				query: location,
+				limit: 1
+			})
+			.send();
+		coordinates = response.body.features[0].geometry.coordinates;
+	}
+
	let maxDistance = distance || 25;
	maxDistance *= 1609.34;
```

## Public

### File: /public/javascripts/use-my-location.js

Create a new file inside of /public/javascripts and name it use-my-location.js then add the following code:

```JS
function geoFindMe(e) {
	e.preventDefault();

	const status = document.querySelector('#status');
	const locationInput = document.querySelector('#location');

	function success(position) {
		const longitude = position.coords.longitude;
		const latitude = position.coords.latitude;

		status.textContent = '';
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
```

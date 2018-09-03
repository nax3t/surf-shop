# Geocoding Post Address and Adding Its Marker to the Map

## Update Post Model
- Remove lat and lng and add coordinates: Array

## Update Posts Controller
- Add the geocodingClient to top of file:
```
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
```
- Update create (POST) method: 
```
let response = await geocodingClient
  .forwardGeocode({
    query: req.body.post.location,
    limit: 1
  })
  .send();
```
- Assign the response's coordinates to req.body.post.coordinates
- Save the post

# Update the Posts Show View
- Remove geojson object
- Remove forEach loop over geoson.features
- Assign post variable from EJS local variable
- Update marker to use post instead

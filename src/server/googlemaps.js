var constants = require('./constants.js'),
	googleMapsClient = require('@google/maps').createClient({
		key: constants.GOOGLE_MAPS_KEY
	})

function fetchTravelTimeEstimate(source, destination, successCallback, errorCallback){
	googleMapsClient.distanceMatrix({
		origins: source,
		destinations: destination,
		mode: 'driving'
	}, function(err, response){
		err ? errorCallback(err) : successCallback(response)
	})
}

module.exports = {
	fetchTravelTimeEstimate: fetchTravelTimeEstimate
}
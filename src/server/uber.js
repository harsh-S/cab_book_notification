var constants = require('./constants.js'),
	Uber = require('node-uber'),
	uber = new Uber({server_token: constants.UBER_SERVER_TOKEN})

function fetchArrivalTimeEstimate(source, successCallback, errorCallback){
	uber.estimates.getETAForLocation(source.lat, source.lng, function(err, response){
		err ? errorCallback(err) : successCallback(response)
	})
}

module.exports = {
	fetchArrivalTimeEstimate: fetchArrivalTimeEstimate
}
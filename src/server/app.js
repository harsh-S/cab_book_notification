var app = require('express')(),
	constants = require('./constants'),
	uber = require('./uber.js'),
	googlemaps = require('./googlemaps.js'),
	mailer = require('./mailer.js'),
	bodyParser = require('body-parser'),
	reminders = [], apiCallLogs = [], intervalObj = {}

app.use(bodyParser.json())   	    // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain)

/*
	For simplicity, all reminders are stored in program memory, instead of DB
*/

function Log(api, email){
	this.time = new Date().toString()
	this.api = api
	this.email = email
}

function checkForReminders(){
	reminders.filter(function(reminder){
		return reminder.mailSent === false
	}).forEach(function(reminder){
		console.log(new Date(reminder.time).toString(), new Date(new Date().getTime() + (reminder.travel_time + reminder.uber_arrival_time)*60000).toString())
		if((reminder.travel_time < 0) || (reminder.uber_arrival_time < 0)){
			if(reminder.travel_time < 0) pollGoogleMapsAPI(reminder)
			if(reminder.uber_arrival_time < 0) pollUberAPI(reminder)
		} else if(new Date(reminder.time) <= new Date(new Date().getTime() + (reminder.travel_time + reminder.uber_arrival_time)*60000)){
			sendMail(reminder)
		} else if(new Date(reminder.time) < new Date(new Date().getTime() + (reminder.travel_time + reminder.uber_arrival_time + constants.BUFFER_TIME)*60000)){
			pollUberAPI(reminder)
			pollGoogleMapsAPI(reminder)
		}
	})
}

function sendMail(reminder){
	mailer.sendReminderMail(reminder.email, function(response){
		reminder.mailSent = true
		reminders.splice(reminders.indexOf(reminder), 1)
		if(reminders.length === 0) clearInterval(intervalObj)
		console.log("Mail Sent. Reminders Left: ", reminders.length, reminders)
	}, function(err){
		// TODO: use logger
		console.log("Error sending mail", err)
	})
}

function pollUberAPI(reminder){
	uber.fetchArrivalTimeEstimate(reminder.source, function(response) {
		response.times.filter(function(time){
			return time.display_name == constants.UBER_CAB_CATEGORY
		}).forEach(function(time){
			reminder.uber_arrival_time = time.estimate/60
		})
		apiCallLogs.push(new Log("Uber", reminder.email))
	}, function(err){
		// TODO: use logger
		console.log("Error polling uber api", err)
	})
}

function pollGoogleMapsAPI(reminder){
	googlemaps.fetchTravelTimeEstimate(reminder.source, reminder.destination, function(response){
  		reminder.travel_time = Math.ceil(response.json.rows[0].elements[0].duration.value/60)
  		apiCallLogs.push(new Log("GoogleMaps", reminder.email))
  	},function(err){
		// TODO: use logger
		console.log("Error polling google maps api", err)
	})
}

app.post('/addReminder', function(req, res) {
	reminders.push(req.body.reminder)
	if(reminders.length === 1) intervalObj = setInterval(checkForReminders, constants.POLL_INTERVAL)
	res.send({success: true})
})

app.get('/fetchAPIcallLogs', function(req, res) {
	res.send({apiCallLogs: apiCallLogs})
})

app.listen(3000)
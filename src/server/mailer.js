var nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport')

var transporter = nodemailer.createTransport(smtpTransport({
	service: 'gmail',
	auth: {
		user: 'testemail.harsh@gmail.com',
		pass: 'harsh12345'
	}
}))

var mailOptions = {
	from: '"Harsh Shah" testemail.harsh@gmail.com',
	to: 'hs616469@gmail.com',
	subject: 'Reminder: Time to book your uberGo',
	text: 'This is to remind you to book uberGo now to reach your destination on time.',
	html: ''
}

function sendReminderMail(email, successCallback, errorCallback){
	mailOptions.to = email
	transporter.sendMail(mailOptions, function(err, info){
		err ? errorCallback(err) : successCallback(info)
	})
}

module.exports = {
	sendReminderMail: sendReminderMail
}
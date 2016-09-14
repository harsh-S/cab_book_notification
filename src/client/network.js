export function addReminder(reminder, successCallback, errorCallback){
	$.ajax({
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		url: 'http://localhost:3000/addReminder/',
		data: JSON.stringify({reminder: reminder}),
		success: successCallback,
		error: errorCallback
	})
}

export function fetchAPIcallLogs(successCallback, errorCallback){
	$.ajax({
		method: 'GET',
		url: 'http://localhost:3000/fetchAPIcallLogs/',
		success: successCallback,
		error: errorCallback
	})
}
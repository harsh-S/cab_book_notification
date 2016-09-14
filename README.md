# cab_book_notification

Sends notification to a user to book a cab, based on a reminder set by her/him.

Files needed to run the code : index.html, dist/bundle.js for client side. 

On server, simply run node app.js

Assumptions: 
1. No DB has been used, hence all reminder remain in server program memory, and upon restarting they are all gone.
2. Reminders added on the same day.
3. Client sees the logs on Refresh. No socket connection used from server to client.

Core Logic
Upon adding a reminder, poll uber and google maps api once to get estimated travel time, and uber arrival time. 
Add a certain BUFFER_TIME to it. 
Once current time equals the travel_time + arrival_time + buffer_time, keep polling uber and googlemaps api to get updated informationn, and once you reach the time to book uber, send mail.

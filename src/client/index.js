import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap'
import { hour_12_regex, minute_regex, latlng_regex, email_regex } from './constants.js'
import { addReminder, fetchAPIcallLogs } from './network.js'

class LatLng {
	constructor(lat=0, lng=0){
		this.lat = lat
		this.lng = lng
	}
}

class Reminder {
	constructor(source=new LatLng(), destination=new LatLng(), time=new Date(), email=''){
		this.source = source
		this.destination = destination
		this.time = time
		this.email = email
		this.travel_time = -1 // in minutes
		this.uber_arrival_time = -1 // in minutes
		this.mailSent = false
	}
}

class AddReminder extends Component {
	constructor(props){
		super(props)
		this.state = {
			source: '',
			destination: '',
			time: '',
			email: ''
		}
		this.getValidationState = this.getValidationState.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}
	getValidationState(key){
		const _state = this.state
		switch(key){
			case 'source':
			case 'destination':
				if(latlng_regex.test(_state[key])) return "success"
				else return "error"
				break
			case 'time':
				let arr = _state.time.split(':')
				if(hour_12_regex.test(arr[0]) && minute_regex.test(arr[1])) return "success"
				else return "error"
				break
			case 'email':
				if(email_regex.test(_state.email)) return "success"
				else return "error"
				break
			default:
				break
		}
	}
	handleChange(key, event){
		this.state[key] = event.target.value
		this.setState(this.state)
	}
	render(){
		const leftCols = 4, rightCols = 2, _props = this.props, _state = this.state
		return(
			<Form horizontal onSubmit={_props.remind.bind(null, _state.source, _state.destination, _state.time, _state.email)}>
			  <FormGroup validationState={this.getValidationState('source')}>
			  	<Col componentClass={ControlLabel} sm={leftCols}>
			  	  Source
			  	</Col>
			  	<Col sm={rightCols}>
			  	  <FormControl
		            type="text"
		            value={_state.source}
		            placeholder="Enter Lat, Long"
		            onChange={this.handleChange.bind(this, 'source')}
		          />
			  	</Col>
			  </FormGroup>
			  <FormGroup validationState={this.getValidationState('destination')}>
			  	<Col componentClass={ControlLabel} sm={leftCols}>
			  	  Destination
			  	</Col>
			  	<Col sm={rightCols}>
			  	  <FormControl
		            type="text"
		            value={_state.destination}
		            placeholder="Enter Lat, Long"
		            onChange={this.handleChange.bind(this, 'destination')}
		          />
			  	</Col>
			  </FormGroup>
			  <FormGroup validationState={this.getValidationState('time')}>
			    <Col componentClass={ControlLabel} sm={leftCols}>
			  	  Time
			  	</Col>
			  	<Col sm={rightCols}>
			  	  <FormControl
		            type="text"
		            value={_state.time}
		            placeholder="HH:MM"
		            onChange={this.handleChange.bind(this, 'time')}
		          />
			  	</Col>
			  </FormGroup>
			  <FormGroup validationState={this.getValidationState('email')}>
			    <Col componentClass={ControlLabel} sm={leftCols}>
			  	  Email
			  	</Col>
			  	<Col sm={rightCols}>
			  	  <FormControl
		            type="text"
		            value={_state.email}
		            placeholder="Email"
		            onChange={this.handleChange.bind(this, 'email')}
		          />
			  	</Col>
			  </FormGroup>
			  <FormGroup>
			  	<Col smOffset={leftCols} sm={rightCols}>
			  	  <Button type="submit">REMIND ME</Button>
			  	</Col>
			  </FormGroup>
			</Form>
		)
	}
}

class ReminderLogs extends Component{
	constructor(props){
		super(props)
		this.state = {
			apiCallLogs: []
		}
		this.remind = this.remind.bind(this)
		this.fetchLogs = this.fetchLogs.bind(this)
	}
	fetchLogs(){
		fetchAPIcallLogs(jqXHR => {
			this.setState({apiCallLogs: jqXHR.apiCallLogs})
		}, jqXHR => alert('Error fetching api call logs'))
	}
	componentDidMount(){
		this.fetchLogs()
	}
	remind(source, destination, time, email, event){
		if(event) event.preventDefault()

		let timeObj = new Date() // assume date is today

		time = time.split(':').map(Number)
		timeObj.setHours(time[0])
		timeObj.setMinutes(time[1])

		source = source.split(',').map(Number)
		destination = destination.split(',').map(Number)
		
		addReminder(new Reminder(new LatLng(source[0], source[1]), 
								 new LatLng(destination[0], destination[1]), 
								 timeObj, email), 
		jqXHR => {
			this.fetchLogs()
			alert("Reminder added !")
		}, jqXHR => {
			console.log("error", jqXHR)
			alert("error adding reminder")
		})
	}
	render(){
		const _state = this.state
		return(
		  <div>
		  	<AddReminder remind={this.remind}/>
		  	<br/><hr/><br/>
		  	<Button bsStyle="primary" onClick={this.fetchLogs}>Refresh</Button>
		  	{_state.apiCallLogs.map(log => 
		  		<p>{"["+log.time.toString()+"] "+log.api+" API queried for user with email: "+log.email}</p>)}
		  </div>
		)
	}
}

ReactDOM.render(<ReminderLogs />,document.getElementById('root'))
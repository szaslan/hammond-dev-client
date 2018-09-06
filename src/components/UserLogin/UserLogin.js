import Flexbox from 'flexbox-react';
import { Form, FormGroup, Input } from 'reactstrap';
import history from '../../history'
import { Link } from "react-router-dom";
import moment from 'moment';
import React, { Component } from 'react';

import './UserLogin.css';
import { masterSetLocalStorage } from '../../App';

let localStorageFields = ['analyzeDisplayTextMessage', 'analyzeDisplayTextNames', 'analyzeDisplayTextNumAssigned', 'analyzeDisplayTextNumCompleted', 'analyzePressed', 'automaticallyFinalize', 'completedAllReviews', 'completedNoReviews', 'completedSomeReviews', 'couldBeFair', 'couldBeHarsh', 'couldBeLenient', 'customBenchmarks', 'customBenchmarksSaved', 'definitelyFair', 'definitelyHarsh', 'definitelyLenient', 'dueDate1', 'dueDate2', 'dueDate3', 'finalized', 'finalizeDisplayTextAverage', 'finalizeDisplayTextNumAssigned', 'finalizeDisplayTextNumCompleted', 'finalizeDisplayTextOutOf', 'flaggedStudents', 'max', 'median', 'min', 'nextClicked', 'penalizingForOriginalIncompletes', 'penalizingForReassignedIncompletes', 'q1', 'q3', 'sendIncompleteMessages', 'spazzy', 'COULD_BE_LOWER_BOUND', 'COULD_BE_UPPER_BOUND', 'MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION', 'MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING', 'MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION', 'MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION', 'SPAZZY_WIDTH', 'THRESHOLD']
let localStorageBooleanFields = ['automaticallyFinalize', 'customBenchmarks', 'customBenchmarksSaved', 'sendIncompleteMessages', 'penalizingForOriginalIncompletes', 'penalizingForReassignedIncompletes']

class UserLogin extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			errors: '',
			value: '',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleLocalStorageData = this.handleLocalStorageData.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.pullAllLocalStorageData = this.pullAllLocalStorageData.bind(this);

		//not included in state so that not shown in React Developer Tool
		this.email = '';
		this.password = '';
		this.canvasUserId = '';
	}

	handleChange(e) {
		this[e.target.name] = e.target.value
	}

	handleLocalStorageData(data) {
		data.forEach(assignmentLevelData => {
			let assignmentId = assignmentLevelData["assignment_id"];
			let courseId = assignmentLevelData["course_id"];
			let dueDateRegex = /dueDate[0-9]+/

			localStorageFields.forEach(field => {
				if (field !== "assignment_id" && field !== "course_id" && field !== "canvas_user_id") {
					let value = assignmentLevelData[field];
					if (value != null) {
						if (value != "N/A") {
							if (field.match(dueDateRegex)) {
								let newDate = new Date(value)
								value = moment(newDate).format('ddd MMM DD YYYY') + " " + moment(newDate).format('HH:mm:ss') + " GMT-0500";
							}
							else if (field === "finalized") {
								let newDate = new Date(value)
								value = moment(newDate).format('l') + ", " + moment(newDate).format('LTS')
							}
							else if (localStorageBooleanFields.includes(field)) {
								value = true;
							}
						}
						masterSetLocalStorage(field + "_" + assignmentId + "_" + courseId, value)
						
					}
				}
			})
		})
		// history.push("/courses");
		history.push({
			pathname: '/courses',
			state: { canvasUserId: this.canvasUserId }
		})
	}

	handleSubmit(event) {
		event.preventDefault();

		var data = {
			email: this.email,
			password: this.password,
		}

		fetch('/login', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				switch (res.status) {
					// case 204:
					// 	this.pullAllLocalStorageData()
					// 	break;
					case 200:
						res.json().then(res => {
							this.canvasUserId = res.canvasUserId;
							this.pullAllLocalStorageData()
						})
						break;
					case 400:
						this.setState({
							errors: "Both the username and password fields must be filled in"
						})
						break;
					case 401:
						this.setState({
							errors: "Invalid username or password"
						})
						break;
					default:
				}
			})
	}

	pullAllLocalStorageData() {
		fetch('/api/pullAllLocalStorageData', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(res => {
				switch (res.status) {
					case 200:
						res.json().then(data => {
							this.handleLocalStorageData(data);
						})
						break;
					case 204:
						// no data in database so just send to courses page
						// history.push("/courses");
						history.push({
							pathname: '/courses',
							state: { canvasUserId: this.canvasUserId }
						})
						break;
					case 400:
						res.json().then(res => {
							history.push({
								pathname: '/error',
								state: {
									context: "This function is called whenever a user successfully logs in. This function takes all of the local storage data saved to the SQL table and saves it in local storage.",
									error: res.error,
									location: "UserLogin.js: pullAllLocalStorageData()",
									message: res.message,
								}
							})
						})
						break;
					default:
				}
			})
	}

	render() {
		return (
			<div className="entire-screen-login">
				<div className="login-group">
					<h1 className="welcome-message-login">Sign In</h1>
					<Form>
						<FormGroup>
							<Input type="email" name="email" id="exampleEmail" placeholder="Email address" onChange={this.handleChange} />
						</FormGroup>
						<FormGroup>
							<Input type="password" name="password" id="examplePassword" placeholder="Password" onChange={this.handleChange} />
						</FormGroup>
						<Flexbox className="flexbox-login">
							<button type="submit" value="Submit" className="new-button" onClick={this.handleSubmit}>Submit</button>
							<Link to="/register">
								<button className="new-button">Register</button>
							</Link>
						</Flexbox>
						{
							this.state.errors ?
								<ul className="errors">{this.state.errors}</ul>
								:
								null
						}
					</Form>
				</div>
			</div>

		);
	}
}

export default UserLogin;
export { localStorageFields, localStorageBooleanFields };
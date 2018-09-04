import Flexbox from 'flexbox-react';
import history from '../../history';
import Loader from 'react-loader-spinner'
import moment from 'moment';
import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { UncontrolledTooltip } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import CustomizableParameters from '../CustomizableParameters/CustomizableParameters';
import FinalizeResults from '../FinalizeResults/FinalizeResults';
import NewDueDate from '../DueDate/NewDueDate';

import 'bootstrap/dist/css/bootstrap.css';
import '../Assignments/Assignments.css';
import '../AssignmentInfo/AssignmentInfo.css';
import '../DueDate/NewDueDate.css'

//have to match constants defined in GradingAlgorithm.js (back-end)
const benchmarkNames = ["SPAZZY_WIDTH", "THRESHOLD", "COULD_BE_LOWER_BOUND", "COULD_BE_UPPER_BOUND", "MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION", "MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION", "MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING", "MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION"]
const defaultBenchmarks = {
	"SPAZZY_WIDTH": 0.10,
	"THRESHOLD": .001,
	"COULD_BE_LOWER_BOUND": 0.7,
	"COULD_BE_UPPER_BOUND": 2.0,
	"MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION": 7,
	"MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION": 3,
	"MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING": 5,
	"MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION": 1 / 2,
}

//explanations underneath set due date calendars
const message1 = "Peer reviews submitted after this date are considered late. Automatic notification messages from Canvas can be set for any student who has not submitted reviews by this date.";
const message2 = "Peer reviews that are still incomplete after this date will be reassigned to students who have completed all of their reviews for this assignment.";
const message3 = "Reassigned peer reviews must be submitted by this date. After this date, any unsubmitted peer reviews will be deleted from Canvas.";

class AnalyzeButton extends Component {
	constructor(props) {
		super(props);

		//analyzePressed and finalizePressed indicate that the corresponding button has been clicked (either manually or automatically)
		//since an assignment can be analyzed multiple times, analyzePressed will be set to true when the analyze button has been clicked (either manually or automatically), and then immediately set back to false
		//since an assignment can only be finalized once, finalizePressed will be set to true when the finalize button has been clicked and will never revert to false
		//analyzeDisplayText and finalizeDisplayText indicate that the corresponding algorithm has finished running and the text/statistics are ready to be displayed
		this.state = {
			analyzeDisplayText: false,
			analyzePressed: false,
			assignedNewPeerReviews: false,
			currTime: null,
			deletedIncompletePeerReviews: false,
			nextClicked: false,
			finalizeDisplayText: false,
			finalizePressed: false,
			loaded: false,
			tooltipOpen1: false,
			tooltipOpen2: false,
		};

		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.backClick = this.backClick.bind(this);
		this.checkForPreviousAnalyzeAndFinalizePresses = this.checkForPreviousAnalyzeAndFinalizePresses.bind(this);
		this.deleteIncompletePeerReviews = this.deleteIncompletePeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.nextClick = this.nextClick.bind(this);
		this.pullDueDatesFromLocalStorage = this.pullDueDatesFromLocalStorage.bind(this);
		this.pullSavedBenchmarksFromLocalStorage = this.pullSavedBenchmarksFromLocalStorage.bind(this);
		this.saveAllPeerReviews = this.saveAllPeerReviews.bind(this);
		this.saveOriginallyAssignedNumbers = this.saveOriginallyAssignedNumbers.bind(this);
		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);
		this.send400Error = this.send400Error.bind(this);
		this.send401Error = this.send401Error.bind(this);
		this.send404Error = this.send404Error.bind(this);
		this.setTime = this.setTime.bind(this);

		this.assignmentId = this.props.assignmentId;
		this.assignmentInfo = this.props.assignmentInfo;
		this.courseId = this.props.courseId;
		this.deadline_1 = null;
		this.deadline_2 = null;
		this.deadline_3 = null;
		this.minutesInterval = null;
		this.secondsInterval = null;
		this.userInputBenchmarks = {
			SPAZZY_WIDTH: defaultBenchmarks.SPAZZY_WIDTH,
			THRESHOLD: defaultBenchmarks.THRESHOLD,
			COULD_BE_LOWER_BOUND: defaultBenchmarks.COULD_BE_LOWER_BOUND,
			COULD_BE_UPPER_BOUND: defaultBenchmarks.COULD_BE_UPPER_BOUND,
			MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
			MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION: defaultBenchmarks.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION,
		}
	}

	assignNewPeerReviews() {
		let data = {
			assignmentId: this.assignmentId,
			courseId: this.courseId,
		}

		fetch('/api/assignNewPeerReviews', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
		})
			.then(res => {
				switch (res.status) {
					case 204:
						//success
						this.setState({
							assignedNewPeerReviews: true,
						})
						break;
					case 400:
						res.json().then(res => {
							this.send400Error("This function is called on Due Date 2. This function reassigns any incomplete peer reviews to students that have already completed all of them.", res.error, "AnalyzeButton.js: assignNewPeerReviews()", res.message)
						})
						break;
					case 401:
						res.json().then(res => {
							this.send401Error(res)
						})
						break;
					case 404:
						//this case should never be hit (no incomplete peer reviews case should be caught in deleteIncompletePeerReviews())
						console.log("there are no incomplete peer reviews that need to be reassigned")
						break;
					default:
				}
			})
	}

	backClick() {
		this.setState({
			nextClicked: false
		});
	}

	checkForPreviousAnalyzeAndFinalizePresses() {
		let data = {
			assignmentId: this.assignmentId
		}

		fetch('/api/hasFinalizeBeenPressed', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				res.json().then(res => {
					if (res.result === "not found") {
						//column in gradebook not found, so assignment has not been finalized
						if (localStorage.getItem("analyzePressed_" + this.assignmentId) == "true") {
							this.setState({
								analyzeDisplayText: true,
							})

							//To automatically finalize if all peer reviews are in
							if (localStorage.getItem("analyzeDisplayTextMessage_" + this.assignmentId) === "All reviews accounted for" && localStorage.getItem("automaticallyFinalize_" + this.assignmentId) === "true") {
								console.log("all peer reviews are in, so we can finalize this assignment")
								this.handleFinalizeClick()
							}
						}
					}
					else if (res.result === "found") {
						this.setState({
							finalizeDisplayText: true,
							finalizePressed: true,
						})
					}
				})
					.then(() => this.pullDueDatesFromLocalStorage())
			})
	}

	deleteIncompletePeerReviews() {
		let data = {
			assignmentId: this.assignmentId,
			courseId: this.courseId,
		}

		fetch('/api/deleteIncompletePeerReviews', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
		})
			.then(res => {
				switch (res.status) {
					case 204:
						this.setState({
							deletedIncompletePeerReviews: true,
						})
						this.assignNewPeerReviews()
						break;
					case 400:
						res.json().then(res => {
							this.send400Error("This function is called on Due Date 2. This function deletes any incomplete peer reviews from Canvas.", res.error, "AnalyzeButton.js: deleteIncompletePeerReviews()", res.message)
						})
						break;
					case 401:
						res.json().then(res => {
							this.send401Error(res)
						})
						break;
					case 404:
						console.log("no incomplete peer reviews to delete")
						//to advance the algorithm
						this.setState({
							assignedNewPeerReviews: true,
							deletedIncompletePeerReviews: true,
						})

						if (localStorage.getItem("automaticallyFinalize_" + this.assignmentId) === "true") {
							this.handleFinalizeClick()
						}
						break;
					default:
				}
			})
	}

	handleAnalyzeClick() {
		this.setState({
			analyzePressed: true,
		})
	}

	handleFinalizeClick() {
		localStorage.setItem("finalized_" + this.assignmentId, this.state.currTime)
		this.setState({
			finalizePressed: true,
		})
	}

	nextClick() {
		this.setState({
			nextClicked: true
		});
	}

	pullDueDatesFromLocalStorage() {
		for (var i = 1; i <= 3; i++) {
			let dueDate = localStorage.getItem("dueDate" + i + "_" + this.assignmentId);
			if (dueDate && dueDate !== "N/A") {
				var newDate = new Date(dueDate)
				this["deadline_" + i] = moment(newDate).format('l') + ", " + moment(newDate).format('LTS')
			}

			if (i == 3) {
				this.pullSavedBenchmarksFromLocalStorage();
			}
		}
	}

	pullSavedBenchmarksFromLocalStorage() {
		benchmarkNames.forEach((benchmark, index, array) => {
			let value = localStorage.getItem(benchmark + "_" + this.assignmentId);
			//If the benchmark has been locally stored
			if (value && value !== "N/A") {
				//If the locally stored benchmark is different from what's currently saved in the object
				if (this.userInputBenchmarks[benchmark] !== value) {
					this.userInputBenchmarks[benchmark] = Number(value)
				}
			}

			if (index == array.length - 1) {
				if (!this.state.loaded) {
					this.setState({
						loaded: true,
					})
				}
			}
		})
	}

	saveAllPeerReviews(deadline) {
		let data = {
			courseId: this.courseId,
			assignmentId: this.assignmentId,
			pointsPossible: this.assignmentInfo.points_possible, //points_possible is JSON field returned from Canvas
		}

		fetch('/api/saveAllPeerReviews', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				switch (res.status) {
					case 204:
						switch (deadline) {
							case 1:
								this.sendIncompleteMessages()
								break;
							case 2:
								this.saveOriginallyAssignedNumbers();
								break;
							case 3:
								break;
							default:
						}
						break;
					case 400:
						res.json().then(res => {
							this.send400Error("This function is called on both Due Date 1 and Due Date 2. This function fetches all peer review objects from Canvas and saves them to the SQL database", res.error, "AnalyzeButton.js: saveAllPeerReviews()", res.message)
						})
						break;
					case 401:
						res.json().then(res => {
							this.send401Error(res)
						})
						break;
					case 404:
						this.send404Error("This function is called on both Due Date 1 and Due Date 2. This function fetches all peer review objects from Canvas and saves them to the SQL database", "AnalyzeButton.js: saveAllPeerReviews()", "No peer reviews have been assigned for this assignment on Canvas.")
						break;
					default:
				}
			})
	}

	saveOriginallyAssignedNumbers() {
		let data = {
			assignmentId: this.assignmentId,
		}

		fetch('/api/savePeerReviewNumbers', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				switch (res.status) {
					case 204:
						this.deleteIncompletePeerReviews();
						break;
					case 400:
						res.json().then(res => {
							this.send400Error("This function is called on Due Date 2 if all peer reviews were fetched and saved correctly. This function records the number of peer reviews assigned and completed by Due Date 2. This information is used to then track stats about any reassigned peer reviews.", res.error, "AnalyzeButton.js: saveOriginallyAssignedNumbers()", res.message)
						})
						break;
					case 404:
						this.send404Error("This function is called on Due Date 2 if all peer reviews were fetched and saved correctly. This function records the number of peer reviews assigned and completed by Due Date 2. This information is used to then track stats about any reassigned peer reviews.", "AnalyzeButton.js: saveOriginallyAssignedNumbers()", "No peer reviews have been assigned in this course on Canvas.")
						break;
					default:
				}
			})
	}

	sendIncompleteMessages() {
		var data = {
			assignmentId: this.assignmentId,
			assignmentName: this.assignmentInfo.name,
			courseId: this.courseId,
			dueDate: localStorage.getItem("dueDate2_" + this.assignmentId),
		}

		fetch('/api/sendIncompleteMessages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
		})
			.then(res => {
				switch (res.status) {
					case 204:
						//success
						break;
					case 400:
						res.json().then(res => {
							this.send400Error("This function is called on Due Date 1 if the option has been checked from the assignment home page and if all peer reviews were fetched and saved correctly. This function sends out a reminder email to each student with incomplete peer reviews.", res.error, "AnalyzeButton.js: sendIncompleteMessages()", res.message)
						})
						break;
					case 401:
						res.json().then(res => {
							this.send401Error(res)
						})
						break;
					case 404:
						//no peer reviews need to be reassigned so there are no messages to be sent
						console.log("there are no peer reviews that need to be reassigned, so there are no messages to send")
						if (localStorage.getItem("automaticallyFinalize_" + this.assignmentId) === "true") {
							this.handleFinalizeClick()
						}
						break;
					default:
				}
			})
	}

	send400Error(context, error, location, message) {
		history.push({
			pathname: '/error',
			state: {
				context: context,
				error: error,
				location: location,
				message: message,
			}
		})
	}

	send401Error(res) {
		history.push({
			pathname: '/unauthorized',
			state: {
				location: res.location,
				message: res.message,
			}
		})
	}

	send404Error(context, location, message) {
		history.push({
			pathname: '/notfound',
			state: {
				context: context,
				location: location,
				message: message,
			}
		})
	}

	setTime() {
		setInterval(() => {
			let newDate = new Date();
			this.setState({
				currTime: newDate.toLocaleString(),
			})
		},
			1000
		)
	}

	componentDidMount() {
		this.checkForPreviousAnalyzeAndFinalizePresses()
		this.setTime()
	}

	componentDidUpdate() {
		this.pullDueDatesFromLocalStorage();

		//To automatically finalize if all peer reviews are in
		if (localStorage.getItem("analyzeDisplayTextMessage_" + this.assignmentId) === "All reviews accounted for" && !this.state.finalizePressed && localStorage.getItem("automaticallyFinalize_" + this.assignmentId) === "true") {
			console.log("all peer reviews are in, so we can finalize this assignment")
			this.handleFinalizeClick()
		}
	}

	render() {
		const { match, location, history } = this.props;
		console.log(history)
    if (this.state.loaded) {
		return (
			<div>
				{
					!this.state.finalizePressed ?
						<div className="assignment-info-content">
							<div className={"calendar-case" + (this.state.nextClicked ? "-hidden" : "")}>
								<p className="header-text">Set Due Date:</p>
								<Flexbox flexWrap="wrap">
									<NewDueDate number="1" assignmentId={this.assignmentId} textDescription={message1} />
									<NewDueDate number="2" assignmentId={this.assignmentId} textDescription={message2} />
									<NewDueDate number="3" assignmentId={this.assignmentId} textDescription={message3} />
								</Flexbox>
								<button className="switch-button next-button" disabled={!localStorage.getItem("dueDate3_" + this.assignmentId)} onClick={this.nextClick}>
									Next
								</button>

								</div>

								<div className={"parameters-case" + (this.state.nextClicked ? "" : "-hidden")}>
									<CustomizableParameters assignmentId={this.assignmentId} userInputBenchmarks={this.userInputBenchmarks} />

									<Flexbox className="flex-dropdown" width="100%" flexWrap="wrap" justify-content="space-around">
										<Row className="analyze">
											<span id="analyze-button-1">
												<button onClick={this.handleAnalyzeClick} className="analyze-button">Analyze</button>
											</span>
											<UncontrolledTooltip delay={{ show: "1200" }} placement="top" target="analyze-button-1">
												Click to view statistics for submitted peer reviews
										</UncontrolledTooltip>
											<span id="finalize-button-1">
												<button className="finalize-button" onClick={this.handleFinalizeClick}>Finalize</button>
											</span>
											<UncontrolledTooltip delay={{ show: "1200" }} placement="top" target="finalize-button-1">
												Click to calculate grades and send to the Canvas gradebook
										</UncontrolledTooltip>
									</Row>
								</Flexbox>

								<button className="switch-button back-button"onClick={this.backClick}>
									Back
								</button>
							</div>

						</div>
						:
						null
				}

					{
						// Displaying results or running either analyze or finalize
						this.state.finalizePressed ?
							// finalize has been clicked at some point
							this.state.finalizeDisplayText ?
								//algorithm has already been run so only rendering the results
								<div>
									<FinalizeResults
										assignmentId={this.assignmentId}
										assignmentInfo={this.assignmentInfo}
										benchmarks={localStorage.getItem("customBenchmarks_" + this.assignmentId) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
										courseId={this.courseId}
										penalizingForOriginalIncompletes={localStorage.getItem("penalizingForOriginalIncompletes_" + this.assignmentId) === "true" ? true : false}
										penalizingForReassignedIncompletes={localStorage.getItem("penalizingForReassignedIncompletes_" + this.assignmentId) === "true" ? true : false}
									/>
								</div>
								:
								//running algorithm
								<div>
									<FinalizeResults
										assignmentId={this.assignmentId}
										assignmentInfo={this.assignmentInfo}
										benchmarks={localStorage.getItem("customBenchmarks_" + this.assignmentId) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
										courseId={this.courseId}
										penalizingForOriginalIncompletes={localStorage.getItem("penalizingForOriginalIncompletes_" + this.assignmentId) === "true" ? true : false}
										penalizingForReassignedIncompletes={localStorage.getItem("penalizingForReassignedIncompletes_" + this.assignmentId) === "true" ? true : false}
										pressed
									/>
									{
										this.setState({
											finalizeDisplayText: true,
										})
									}
								</div>
							:
							//finalize has not yet been clicked (if finalize has been clicked, none of the analyze results will show)
							<div>
								{
									this.state.analyzePressed ?
										//analyze has been clicked
										<div>
											<AnalyzeResults
												assignmentId={this.assignmentId}
												assignmentInfo={this.assignmentInfo}
												benchmarks={localStorage.getItem("customBenchmarks_" + this.assignmentId) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
												courseId={this.courseId}
												pressed
											/>
											{
												this.setState({
													analyzeDisplayText: true,
													analyzePressed: false,
												})
											}
										</div>
										:
										null
								}
								{
									this.state.analyzeDisplayText ?
										<AnalyzeResults
											assignmentId={this.assignmentId}
											benchmarks={localStorage.getItem("customBenchmarks_" + this.assignmentId) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
										/>
										:
										null
								}
							</div>
					}

					{/* Due Date Functionality */}
					{
						this.deadline_1 != null && this.deadline_1 === this.state.currTime && localStorage.getItem("sendIncompleteMessages_" + this.assignmentId) === "true" ?
							this.saveAllPeerReviews(1)
							:
							null
					}
					{
						this.deadline_2 != null && this.deadline_2 === this.state.currTime && !this.state.assignedNewPeerReviews && !this.state.deletedIncompletePeerReviews ?
							this.saveAllPeerReviews(2)
							:
							null
					}
					{
						this.deadline_3 != null && this.deadline_3 === this.state.currTime && !this.state.finalizePressed ?
							this.handleFinalizeClick()
							:
							null
					}
				</div>
			)
		}

		return (
			<Loader type="TailSpin" color="black" height={80} width={80} />
		)
	}
}

export default withRouter(AnalyzeButton);
export { benchmarkNames, defaultBenchmarks };
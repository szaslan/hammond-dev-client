import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import moment from 'moment';
import { Row } from 'react-bootstrap';
import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import CustomizableParameters from '../CustomizableParameters/CustomizableParameters';
import DueDates from '../DueDates/DueDates';
import FinalizeResults from '../FinalizeResults/FinalizeResults';
import NewDueDate from '../DueDate/NewDueDate';
import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

//have to match constants defined in GradingAlgorithm.js (back-end)
const BENCHMARKS = {
	"WIDTH_OF_STD_DEV_RANGE": 0.10,
	"THRESHOLD": .001,
	"COULD_BE_LOWER_BOUND": 0.7,
	"COULD_BE_UPPER_BOUND": 2.0,
	"MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION": 7,
	"MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION": 3,
	"MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING": 5,
	"MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING": 1 / 2,
}
const benchmark_names = ["WIDTH_OF_STD_DEV_RANGE", "THRESHOLD", "COULD_BE_LOWER_BOUND", "COULD_BE_UPPER_BOUND", "MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION", "MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION", "MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING", "MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"]
const message1 = "Peer reviews submitted after this date will be considered late. Any student who has not submitted reviews by this date will receive a notification message from Canvas.";
const message2 = "Late peer reviews submitted after this date will be reassigned to students who have completed all of their reviews for this assignment.";
const message3 = "Reassigned peer reviews must be submitted by this deadline. After this date, any unsubmitted peer reviews will be deleted from Canvas.";

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
			assigned_new_peer_reviews: false,
			curr_time: null,
			deleted_incomplete_peer_reviews: false,
			finalizeDisplayText: false,
			finalizePressed: false,
			tooltipOpen1: false,
			tooltipOpen2: false,
			unauthorized_error: false,
			unauthorized_error_message: null,
		};

		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.checkForPreviousAnalyzeAndFinalizePresses = this.checkForPreviousAnalyzeAndFinalizePresses.bind(this);
		this.clearCustomBenchmarks = this.clearCustomBenchmarks.bind(this);
		this.deleteIncompletePeerReviews = this.deleteIncompletePeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.pullDueDatesFromLocalStorage = this.pullDueDatesFromLocalStorage.bind(this);
		this.pullSavedBenchmarksFromLocalStorage = this.pullSavedBenchmarksFromLocalStorage.bind(this);
		this.saveAllPeerReviews = this.saveAllPeerReviews.bind(this);
		this.saveOriginallyAssignedNumbers = this.saveOriginallyAssignedNumbers.bind(this);
		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);

		this.algorithm_benchmarks = {
			WIDTH_OF_STD_DEV_RANGE: BENCHMARKS.WIDTH_OF_STD_DEV_RANGE,
			THRESHOLD: BENCHMARKS.THRESHOLD,
			COULD_BE_LOWER_BOUND: BENCHMARKS.COULD_BE_LOWER_BOUND,
			COULD_BE_UPPER_BOUND: BENCHMARKS.COULD_BE_UPPER_BOUND,
			MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
			MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
		}
		this.assignment_id = this.props.assignmentId;
		this.assignment_info = this.props.assignmentInfo;
		this.course_id = this.props.courseId;
		this.deadline_1 = null;
		this.deadline_2 = null;
		this.deadline_3 = null;

	}

	assignNewPeerReviews() {
		let data = {
			assignment_id: this.assignment_id,
			course_id: this.course_id,
		}

		fetch('/api/assign_new_peer_reviews', {
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
							assigned_new_peer_reviews: true,
						})
						break;
					case 400:
						console.log("there was an error when reassigning incomplete peer reviews")
						break;
					case 404:
						console.log("there are no incomplete peer reviews that need to be reassigned")
						break;
				}
			})
	}

	checkForPreviousAnalyzeAndFinalizePresses() {
		if (localStorage.getItem("analyzePressed_" + this.assignment_id)) {
			this.setState({
				analyzeDisplayText: true,
			})

			//To automatically finalize if all peer reviews are in
			if (localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) && localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) == "All reviews accounted for") {
				console.log("all peer reviews are in, so we can finalize this assignment")
				this.handleFinalizeClick()
			}
		}

		let data = {
			assignment_id: this.assignment_id
		}

		fetch('/api/has_finalize_been_pressed', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				res.json().then(res => {
					if (res.result == "not found") {
						//column in gradebook not found, so assignment has not been finalized
					}
					else if (res.result == "found") {
						this.setState({
							finalizeDisplayText: true,
							finalizePressed: true,
						})
					}
				})
			})
	}

	clearCustomBenchmarks() {
		console.log("clearing custom benchmarks")

		localStorage.removeItem("custom_benchmarks_" + this.assignment_id)

		benchmark_names.forEach(benchmark => {
			if (localStorage.getItem(benchmark + "_" + this.assignment_id)) {
				localStorage.removeItem(benchmark + "_" + this.assignment_id);
			}
		})

		this.algorithm_benchmarks = {
			WIDTH_OF_STD_DEV_RANGE: BENCHMARKS.WIDTH_OF_STD_DEV_RANGE,
			THRESHOLD: BENCHMARKS.THRESHOLD,
			COULD_BE_LOWER_BOUND: BENCHMARKS.COULD_BE_LOWER_BOUND,
			COULD_BE_UPPER_BOUND: BENCHMARKS.COULD_BE_UPPER_BOUND,
			MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
			MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
			MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
		}
	}

	deleteIncompletePeerReviews() {
		let data = {
			course_id: this.course_id,
			assignment_id: this.assignment_id,
			points_possible: this.assignment_info.points_possible,
		}

		fetch('/api/delete_incomplete_peer_reviews', {
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
							deleted_incomplete_peer_reviews: true,
						})
						this.assignNewPeerReviews()
						break;
					case 400:
						console.log("encountered an error when trying to delete incomplete peer reviews that are being reassigned")
						break;
					case 404:
						console.log("no incomplete peer reviews to delete")
						//to advance the algorithm
						this.setState({
							assigned_new_peer_reviews: true,
						})
						this.handleFinalizeClick()
						break;
				}
			})
	}

	handleAnalyzeClick() {
		this.setState({
			analyzePressed: true,
		})
	}

	handleFinalizeClick() {
		localStorage.setItem("finalized_" + this.assignment_id, this.state.curr_time)
		this.setState({
			finalizePressed: true,
		})
	}

	pullDueDatesFromLocalStorage() {
		for (var i = 1; i <= 3; i++) {
			if (localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i)) {
				let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i);
				var new_date = new Date(formatted_date)

				this["deadline_" + i] = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
			}
		}
	}

	pullSavedBenchmarksFromLocalStorage() {
		benchmark_names.forEach((benchmark) => {
			//If the benchmarks has been locally stored
			if (localStorage.getItem(benchmark + "_" + this.assignment_id)) {
				//If the locally stored benchmark is different from what's currently saved in the object
				if (this.algorithm_benchmarks[benchmark] != localStorage.getItem(benchmark + "_" + this.assignment_id)) {
					this.algorithm_benchmarks[benchmark] = Number(localStorage.getItem(benchmark + "_" + this.assignment_id))
				}
			}
		})
	}

	saveAllPeerReviews(deadline) {
		let data = {
			course_id: this.course_id,
			assignment_id: this.assignment_id,
			points_possible: this.assignment_info.points_possible,
		}

		fetch('/api/save_all_peer_reviews', {
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
								this.saveOriginallyAssignedNumbers();
								break;
							case 2:
								this.sendIncompleteMessages()
								break;
							case 3:
								break;
						}
						break;
					case 400:
						console.log("ran into an error when trying to save all peer reviews from canvas")
						break;
					case 401:
						res.json().then(res => {
							this.setState({
								unauthorized_error: true,
								unauthorized_error_message: res.message,
							})
						})
						break;
					case 404:
						console.log("no peer reviews assigned for this assignment")
						break;
				}
			})
	}

	saveOriginallyAssignedNumbers() {
		let data = {
			assignment_id: this.assignment_id,
		}

		fetch('/api/save_peer_review_numbers', {
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
						console.log("encountered an error when trying to save originally assigned peer review numbers")
						break;
					case 404:
						console.log("no peer reviews have been completed for this assignment")
						break;
				}
			})
	}

	sendIncompleteMessages() {
		var data = {
			assignment_id: this.assignment_id,
			assignment_name: this.assignment_info.name,
			course_id: this.course_id,
			due_date: localStorage.getItem("calendarDate_" + this.assignment_id + "_2"),
		}

		fetch('/api/send_incomplete_messages', {
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
						console.log("there was an error when sending messages to all students with incomplete peer reviews")
						break;
					case 404:
						//******* want to automatically finalize here *******
						console.log("there are no peer reviews that need to be reassigned, so there are no messages to send")
						this.handleFinalizeClick()
						break;
				}
			})
	}

	componentDidMount() {
		this.checkForPreviousAnalyzeAndFinalizePresses()
		this.pullDueDatesFromLocalStorage();
		this.pullSavedBenchmarksFromLocalStorage();

		setInterval(() => {
			this.setState({
				curr_time: new Date().toLocaleString(),
			})
		},
			1000
		)
	}

	componentDidUpdate() {
		this.pullDueDatesFromLocalStorage();
		this.pullSavedBenchmarksFromLocalStorage();

		//To automatically finalize if all peer reviews are in
		if (localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) && localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) == "All reviews accounted for" && !this.state.finalizePressed) {
			console.log("all peer reviews are in, so we can finalize this assignment")
			this.handleFinalizeClick()
		}
	}

	render() {
		if (this.state.unauthorized_error) {
			return (
				<UnauthorizedError message={this.state.unauthorized_error_message} />
			)
		}

		return (
			<div>
				{
					!this.state.finalizePressed ?
						<div className="assignment-info-content">
							{/* <Row> */}
{/*
							<div className="calendar-case">					
									<Flexbox flexWrap="wrap">
										<NewDueDate number="1" assignmentId={this.assignment_id} />
										<NewDueDate number="2" assignmentId={this.assignment_id} />
										<NewDueDate number="3" assignmentId={this.assignment_id} />
									</Flexbox>
							</div>

							<form>
								<label>
									<input name="sendIncompleteMessages" type="checkbox" checked={this.state.sendIncompleteMessages} onChange={this.handleInputChange} />
									Send Messages to All Students Who Have Incomplete Peer Reviews At Due Date 1?:
								</label>
								<br></br>
								<label>
									<input name="custom_benchmarks" type="checkbox" checked={this.state.custom_benchmarks} onChange={this.handleInputChange} />
									Custom Benchmarks For Grading Algorithm?:
								</label>
								<label>
									<input name="penalizing_for_incompletes" type="checkbox" checked={this.state.penalizing_for_incompletes} onChange={this.handleInputChange} />
									Would You Like to Penalize Students' Weights For Incomplete Peer Reviews?:
								</label>
*/}
							<DueDates assignmentId={this.assignment_id} messages={{ message1: message1, message2: message2, message3: message3 }} />
							<CustomizableParameters assignmentId={this.assignment_id} />

							<Flexbox className="flex-dropdown" width="300px" flexWrap="wrap" justify-content="space-around">
								{
									localStorage.getItem("custom_benchmarks_" + this.assignment_id) && !localStorage.getItem("custom_benchmarks_saved_" + this.assignment_id) ?
										<div>
											<AlgorithmBenchmarks originalBenchmarks={BENCHMARKS} benchmarks={this.algorithm_benchmarks} assignmentId={this.assignment_id} />
											<button className="clear-local-button" onClick={this.clearCustomBenchmarks}> Clear All</button>
										</div>
										:
										null
								}
								<span id="analyze-button-1">
									<button onClick={this.handleAnalyzeClick} className="analyze" id="analyze">Analyze</button>
								</span>
								<UncontrolledTooltip delay={{ show: "1200" }} placement="top" target="analyze-button-1">
									Click to view statistics for submitted peer reviews
								</UncontrolledTooltip>

								<span id="finalize-button-1">
									<button className="analyze" id="finalize" onClick={this.handleFinalizeClick}>Finalize</button>
								</span>
								<UncontrolledTooltip delay={{ show: "1200" }} placement="top" target="finalize-button-1">
									Click to calculate grades and send to the Canvas gradebook
								</UncontrolledTooltip>
							</Flexbox>
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
									assignmentId={this.assignment_id}
									assignmentInfo={this.assignment_info}
									benchmarks={localStorage.getItem("custom_benchmarks_" + this.assignment_id) ? this.algorithm_benchmarks : BENCHMARKS}
									courseId={this.course_id}
									penalizingForIncompletes={localStorage.getItem("penalizing_for_incompletes" + this.assignment_id) ? true : false}
									penalizingForReassigned={localStorage.getItem("penalizing_for_reassigned" + this.assignment_id) ? true : false}
								/>
							</div>
							:
							//running algorithm
							<div>
								<FinalizeResults
									assignmentId={this.assignment_id}
									assignmentInfo={this.assignment_info}
									benchmarks={localStorage.getItem("custom_benchmarks_" + this.assignment_id) ? this.algorithm_benchmarks : BENCHMARKS}
									courseId={this.course_id}
									penalizingForIncompletes={localStorage.getItem("penalizing_for_incompletes" + this.assignment_id) ? true : false}
									penalizingForReassigned={localStorage.getItem("penalizing_for_reassigned" + this.assignment_id) ? true : false}
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
											assignmentId={this.assignment_id}
											assignmentInfo={this.assignment_info}
											courseId={this.course_id}
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
										assignmentId={this.assignment_id}
									/>
									:
									null
							}
						</div>
				}

				{/* Due Date Functionality */}
				{
					this.deadline_1 != null && this.deadline_1 == this.state.curr_time && localStorage.getItem("send_incomplete_messages_" + this.assignment_id) ?
						this.saveAllPeerReviews(1)
						:
						null
				}
				{
					this.deadline_2 != null && this.deadline_2 == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_incomplete_peer_reviews ?
						this.saveAllPeerReviews(2)
						:
						null
				}
				{
					this.deadline_3 != null && this.deadline_3 == this.state.curr_time && !this.state.finalizePressed ?
						this.handleFinalizeClick()
						:
						null
				}
			</div>
		)
	}
}

export default AnalyzeButton;
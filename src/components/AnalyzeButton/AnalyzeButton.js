import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import history from '../../history';
import moment from 'moment';

import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import DueDate from '../DueDate/DueDate';
import FinalizeResults from '../FinalizeResults/FinalizeResults';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

const BENCHMARKS = {
	"WIDTH_OF_STD_DEV_RANGE_BENCHMARK": 0.10,
	"THRESHOLD_BENCHMARK": 2,
	"COULD_BE_LOWER_BOUND_BENCHMARK": 0.7,
	"COULD_BE_UPPER_BOUND_BENCHMARK": 2.0,
	"MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_BENCHMARK": 7,
	"MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_BENCHMARK": 3,
	"MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK": 5,
	"MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK": 1 / 2,
}
var message1 = "Peer reviews submitted after this date will be considered late. Any student who has not submitted reviews by this date will receive a notification message from Canvas.";
var message2 = "Late peer reviews submitted after this date will be reassigned to students who have completed all of their reviews for this assignment.";
var message3 = "Reassigned peer reviews must be submitted by this deadline. After this date, any unsubmitted peer reviews will be deleted from Canvas.";

let variables = ["sendIncompleteMessages", "custom_benchmarks", "penalizing_for_incompletes", "penalizing_for_reassigned"];
let benchmark_names = ["WIDTH_OF_STD_DEV_RANGE", "THRESHOLD", "COULD_BE_LOWER_BOUND", "COULD_BE_UPPER_BOUND", "MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION", "MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION", "MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING", "MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"]

class AnalyzeButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
			algorithm_benchmarks: {
				WIDTH_OF_STD_DEV_RANGE: BENCHMARKS.WIDTH_OF_STD_DEV_RANGE_BENCHMARK,
				THRESHOLD: BENCHMARKS.THRESHOLD_BENCHMARK,
				COULD_BE_LOWER_BOUND: BENCHMARKS.COULD_BE_LOWER_BOUND_BENCHMARK,
				COULD_BE_UPPER_BOUND: BENCHMARKS.COULD_BE_UPPER_BOUND_BENCHMARK,
				MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_BENCHMARK,
				MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_BENCHMARK,
				MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK,
				MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK,
			},
			analyzeDisplayText: false,
			analyzePressed: false,
			assigned_new_peer_reviews: false,
			curr_time: null,
			custom_benchmarks: false,
			deleted_incomplete_peer_reviews: false,
			finalizeDisplayText: false,
			finalizePressed: false,
			penalizing_for_incompletes: false,
			penalizing_for_reassigned: false,
			sendIncompleteMessages: false,
			tooltipOpen1: false,
			tooltipOpen2: false,

			error: false,
		};

		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.clearCustomBenchmarks = this.clearCustomBenchmarks.bind(this);
		this.deleteIncompletePeerReviews = this.deleteIncompletePeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.reassignPeerReviews = this.reassignPeerReviews.bind(this);
		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);

		this.assignment_id = this.props.assignmentId;
		this.assignment_info = this.props.assignmentInfo;
		this.course_id = this.props.courseId;
		this.deadline_1 = null;
		this.deadline_2 = null;
		this.deadline_3 = null;

		this.error_message = "An error has occurred. Please consult the console to see what has gone wrong"
	}

	assignNewPeerReviews() {
		this.setState({
			assigned_new_peer_reviews: true,
		})

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
				if (res.status == 204) {
					//success
				}
				else if (res.status == 400) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("there was an error when reassigning incomplete peer reviews")
				}
				else if (res.status == 404) {
					console.log("there are no incomplete peer reviews that need to be reassigned")
				}
			})
	}

	clearCustomBenchmarks() {
		benchmark_names.forEach(benchmark => {
			if (localStorage.getItem(benchmark + "_" + this.assignment_id)) {
				localStorage.removeItem(benchmark + "_" + this.assignment_id);
			}
		})

		this.setState({
			algorithm_benchmarks: {
				WIDTH_OF_STD_DEV_RANGE: BENCHMARKS.WIDTH_OF_STD_DEV_RANGE_BENCHMARK,
				THRESHOLD: BENCHMARKS.THRESHOLD_BENCHMARK,
				COULD_BE_LOWER_BOUND: BENCHMARKS.COULD_BE_LOWER_BOUND_BENCHMARK,
				COULD_BE_UPPER_BOUND: BENCHMARKS.COULD_BE_UPPER_BOUND_BENCHMARK,
				MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_BENCHMARK,
				MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: BENCHMARKS.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_BENCHMARK,
				MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK,
				MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: BENCHMARKS.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_BENCHMARK,
			}
		})
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
				if (res.status == 204) {
					this.setState({
						deleted_incomplete_peer_reviews: true,
					})
					this.assignNewPeerReviews()
				}
				else if (res.status == 400) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("encountered an error when trying to delete incomplete peer reviews that are being reassigned")
				}
				else if (res.status == 404) {
					console.log("no incomplete peer reviews to delete")
					//to advance the algorithm
					this.setState({
						assigned_new_peer_reviews: true,
					})
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

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		if (value) {
			localStorage.setItem(name + "_" + this.assignment_id, value)
		}
		else {
			localStorage.removeItem(name + "_" + this.assignment_id)
		}

		this.setState({
			[name]: value,
		});
	}

	reassignPeerReviews() {
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
				if (res.status == 204) {
					fetch('/api/save_peer_review_numbers', {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(data)
					})
						.then(res => {
							if (res.status == 204) {
								this.deleteIncompletePeerReviews();
							}
							else if (res.status == 400) {
								if (!this.state.error) {
									this.setState({
										error: true
									})
								}
								console.log("encountered an error when trying to save originally assigned peer review numbers")
							}
							else if (res.status == 404) {
								if (!this.state.error) {
									this.setState({
										error: true
									})
								}
								console.log("no peer reviews have been completed for this assignment")
							}
						})
				}
				else if (res.status == 400) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("ran into an error when trying to save all peer reviews from canvas")
				}
				else if (res.status === 401) {
					history.push("/login")
					throw new Error();
				}
				else if (res.status == 404) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("no peer reviews assigned for this assignment")
				}
			})
			.catch(err => console.log("unauthorized request when saving peer reviews from canvas"))

	}

	sendIncompleteMessages() {
		let duedate = localStorage.getItem("calendarDate_" + this.assignment_id + "_2")

		var data = {
			course_id: this.course_id,
			assignment_id: this.assignment_id,
			assignment_name: this.assignment_info.name,
			points_possible: this.assignment_info.points_possible,
			due_date: duedate,
		}


		fetch('/api/save_all_peer_reviews', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				if (res.status == 204) {
					fetch('/api/send_incomplete_messages', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(data),
					})
						.then(res => {
							if (res.status == 204) {
								//success
							}
							else if (res.status == 400) {
								if (!this.state.error) {
									this.setState({
										error: true
									})
								}
								console.log("there was an error when sending messages to all students with incomplete peer reviews")
							}
							else if (res.status == 404) {
								//*******want to automatically finalize here*******

								console.log("there are no peer reviews that need to be reassigned, so there are no messages to send")
							}
						})
				}
				else if (res.status == 400) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("ran into an error when trying to save all peer reviews from canvas")
				}
				else if (res.status === 401) {
					history.push("/login")
					throw new Error();
				}
				else if (res.status == 404) {
					if (!this.state.error) {
						this.setState({
							error: true
						})
					}
					console.log("no peer reviews assigned for this assignment")
				}
			})
			.catch(err => console.log("unauthorized request when saving all peer reviews from canvas"))

	}

	componentDidMount() {
		if (localStorage.getItem("analyzePressed_" + this.assignment_id)) {
			this.setState({
				analyzeDisplayText: true,
			})

			//To automatically finalize if all peer reviews are in
			if (localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) && localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) == "All reviews accounted for") {
				console.log("all peer reviews are in, so we can finalize this assignment")
				// this.handleFinalizeClick()
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
				if (res.status == 204) {
					this.setState({
						finalizeDisplayText: true,
						finalizePressed: true,
					})
				}
				else if (res.status == 404) {
					//column in gradebook not found, so assignment has not been finalized
				}
			})

		for (var i = 1; i <= 3; i++) {
			if (localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i)) {
				let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i);
				var new_date = new Date(formatted_date)

				this["deadline_" + i] = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
			}
		}

		variables.forEach(variable => {
			if (localStorage.getItem(variable + "_" + this.assignment_id)) {
				if (!this.state[variable]) {
					this.setState({
						[variable]: true,
					})
				}
			}
		})

		//Code is running at same time
		if (localStorage.getItem("WIDTH_OF_STD_DEV_RANGE_" + this.assignment_id)) {
			if (this.state.algorithm_benchmarks["WIDTH_OF_STD_DEV_RANGE_BENCHMARK"] != localStorage.getItem("WIDTH_OF_STD_DEV_RANGE_" + this.assignment_id)) {
				this.setState({
					algorithm_benchmarks: {
						WIDTH_OF_STD_DEV_RANGE: localStorage.getItem("WIDTH_OF_STD_DEV_RANGE_" + this.assignment_id),
						THRESHOLD: this.state.algorithm_benchmarks.THRESHOLD,
						COULD_BE_LOWER_BOUND: this.state.algorithm_benchmarks.COULD_BE_LOWER_BOUND,
						COULD_BE_UPPER_BOUND: this.state.algorithm_benchmarks.COULD_BE_UPPER_BOUND,
						MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
						MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: this.state.algorithm_benchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
						MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
						MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: this.state.algorithm_benchmarks.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
					}
				})
			}
		}
		if (localStorage.getItem("THRESHOLD_" + this.assignment_id)) {
			if (this.state.algorithm_benchmarks["THRESHOLD_BENCHMARK"] != localStorage.getItem("THRESHOLD_" + this.assignment_id)) {
				this.setState({
					algorithm_benchmarks: {
						WIDTH_OF_STD_DEV_RANGE: this.state.algorithm_benchmarks.WIDTH_OF_STD_DEV_RANGE,
						THRESHOLD: localStorage.getItem("THRESHOLD_" + this.assignment_id),
						COULD_BE_LOWER_BOUND: this.state.algorithm_benchmarks.COULD_BE_LOWER_BOUND,
						COULD_BE_UPPER_BOUND: this.state.algorithm_benchmarks.COULD_BE_UPPER_BOUND,
						MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
						MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: this.state.algorithm_benchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
						MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
						MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: this.state.algorithm_benchmarks.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
					}
				})
			}
		}

		setInterval(() => {
			this.setState({
				curr_time: new Date().toLocaleString(),
			})
		},
			1000
		)
	}

	componentDidUpdate() {
		for (var i = 1; i <= 3; i++) {
			if (localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i)) {
				let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_" + i);
				var new_date = new Date(formatted_date)

				this["deadline_" + i] = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
			}
		}

		variables.forEach(variable => {
			if (localStorage.getItem(variable + "_" + this.assignment_id)) {
				if (!this.state[variable]) {
					this.setState({
						[variable]: true,
					})
				}
			}
		})
	}

	render() {
		if (this.state.error) {
			return (
				<div>
					{this.error_message}
				</div>
			)
		}
		else {
			return (
				<div>
					{
						!this.state.finalizePressed ?
							<div className="assignment-info-content">
								<DueDate
									name="Due Date 1"
									assignmentId={this.assignment_id}
									number="1"
									message={message1}
								/>
								{localStorage.getItem("calendarDate_" + this.assignment_id + "_1") ?
									<DueDate
										name="Due Date 2"
										assignmentId={this.assignment_id}
										number="2"
										message={message2}
									/>
									:
									null
								}
								{localStorage.getItem("calendarDate_" + this.assignment_id + "_1") && localStorage.getItem("calendarDate_" + this.assignment_id + "_2") ?
									<DueDate
										name="Due Date 3"
										assignmentId={this.assignment_id}
										number="3"
										message={message3}
									/>
									:
									null
								}
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
									{
										this.state.penalizing_for_incompletes ?
											<label>
												<input name="penalizing_for_reassigned" type="checkbox" checked={this.state.penalizing_for_reassigned} onChange={this.handleInputChange} />
												Would You Like to Penalize For Peer Reviews That Were Reassigned, But Not Completed?:
										</label>
											:
											null
									}

								</form>
							</div>
							:
							null
					}
					{
						!this.state.finalizePressed && !this.state.finalizeDisplayText ?
							<div>
								<Flexbox className="flex-dropdown" width="300px" flexWrap="wrap" justify-content="space-around">
									{this.state.custom_benchmarks ?
										<div>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.WIDTH_OF_STD_DEV_RANGE}
												min={0}
												step={0.01}
												placeholder="WIDTH_OF_STD_DEV_RANGE"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.THRESHOLD}
												min={0}
												step={.0001}
												placeholder="THRESHOLD"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.COULD_BE_LOWER_BOUND}
												min={0}
												max={1}
												step={.01}
												placeholder="COULD_BE_LOWER_BOUND"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.COULD_BE_UPPER_BOUND}
												min={1}
												max={5}
												step={.01}
												placeholder="COULD_BE_UPPER_BOUND"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION}
												min={0}
												step={1}
												placeholder="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION}
												min={0}
												step={1}
												placeholder="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING}
												min={0}
												step={1}
												placeholder="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"
												assignmentId={this.assignment_id}
											/>
											<AlgorithmBenchmarks
												value={this.state.algorithm_benchmarks.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING}
												min={0}
												max={1}
												step={.001}
												placeholder="MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"
												assignmentId={this.assignment_id}
											/>
											<button className="clear-local-button" onClick={this.clearCustomBenchmarks}> Clear Custom Benchmarks</button>
											<br></br>
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
										Click to send grades to the Canvas gradebook
               					</UncontrolledTooltip>
								</Flexbox>
							</div>
							:
							null
					}
					{
						this.state.finalizePressed && !this.state.finalizeDisplayText ?
							<div>
								<FinalizeResults
									penalizingForIncompletes={this.state.penalizing_for_incompletes}
									penalizingForReassigned={this.state.penalizing_for_reassigned}
									assignmentInfo={this.assignment_info}
									courseId={this.course_id}
									assignmentId={this.assignment_id}
									pressed={true}
									benchmarks={this.state.algorithm_benchmarks}
								/>
								{
									this.setState({
										finalizeDisplayText: true,
									})
								}
							</div>
							:
							null

					}
					{
						this.state.finalizePressed && this.state.finalizeDisplayText ?
							<div>
								<FinalizeResults
									penalizingForIncompletes={this.state.penalizing_for_incompletes}
									penalizingForReassigned={this.state.penalizing_for_reassigned}
									assignmentInfo={this.assignment_info}
									courseId={this.course_id}
									assignmentId={this.assignment_id}
									pressed={false}
									benchmarks={this.state.algorithm_benchmarks}
									progress={100}
								/>
							</div>
							:
							null
					}
					{
						!this.state.finalizePressed && this.state.analyzeDisplayText ?
							<AnalyzeResults
								assignmentInfo={this.assignment_info}
								courseId={this.course_id}
								assignmentId={this.assignment_id}
								pressed={false}
								benchmarks={this.state.algorithm_benchmarks}
							/>
							:
							null
					}
					{
						!this.state.finalizePressed && this.state.analyzePressed ?
							<div>
								<AnalyzeResults
									assignmentInfo={this.assignment_info}
									courseId={this.course_id}
									assignmentId={this.assignment_id}
									pressed={true}
									benchmarks={this.state.algorithm_benchmarks}
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
						this.deadline_1 != null && this.deadline_1 == this.state.curr_time && this.state.sendIncompleteMessages ?
							<div>
								{console.log("due date 1 hit")}
								{this.sendIncompleteMessages()}
							</div>
							:
							null
					}
					{
						this.deadline_2 != null && this.deadline_2 == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_incomplete_peer_reviews ?
							<div>
								{console.log("due date 2 hit")}
								{this.reassignPeerReviews()}
							</div>
							:
							null
					}
					{
						this.deadline_3 != null && this.deadline_3 == this.state.curr_time && !this.state.finalizePressed ?
							<div>
								{console.log("due date 3 hit")}
								{this.handleFinalizeClick()}
							</div>
							:
							null
					}
				</div>
			)
		}
	}
}
export default AnalyzeButton;
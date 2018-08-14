import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import moment from 'moment';

import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import DueDate from '../DueDate/DueDate';
import FinalizeResults from '../FinalizeResults/FinalizeResults';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

var message1 = "Peer reviews submitted after this date will be considered late. Any student who has not submitted reviews by this date will receive a notification message from Canvas.";
var message2 = "Late peer reviews submitted after this date will be reassigned to students who have completed all of their reviews for this assignment.";
var message3 = "Reassigned peer reviews must be submitted by this deadline. After this date, any unsubmitted peer reviews will be deleted from Canvas.";

class AnalyzeButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
			algorithm_benchmarks: {
				WIDTH_OF_STD_DEV_RANGE: 0.10,
				THRESHOLD: 2,
				COULD_BE_LOWER_BOUND: 0.7,
				COULD_BE_UPPER_BOUND: 2.0,
				MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: 7,
				MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: 3,
				MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: 5,
				MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: 1 / 2,
			},
			analyzeDisplayText: false,
			analyzePressed: false,
			assigned_new_peer_reviews: false,
			curr_time: null,
			custom_benchmarks: false,
			deleted_old_peer_reviews: false,
			finalizeDisplayText: false,
			finalizePressed: false,
			penalizing_for_incompletes: false,
			penalizing_for_reassigned: false,
			sendIncompleteMessages: false,
			tooltipOpen1: false,
			tooltipOpen2: false,
		};

		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.deleteOldPeerReviews = this.deleteOldPeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);

		this.assignment_id = this.props.assignment_id;
		this.assignment_info = this.props.assignment_info;
		this.course_id = this.props.course_id;
		this.deadline_1 = null;
		this.deadline_2 = null;
		this.deadline_3 = null;
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
	}

	deleteOldPeerReviews() {
		let data = {
			course_id: this.course_id,
			assignment_id: this.assignment_id,
			points_possible: this.assignment_info.points_possible,
		}
		console.log("3: fetching peer review data from canvas")
		fetch('/api/save_all_peer_reviews', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(() => {
				fetch('/api/save_peer_review_numbers', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				})
					.then(() => {
						this.setState({
							deleted_old_peer_reviews: true,
						})

						fetch('/api/delete_peer_reviews', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(data),
						})
							.then(() => {
								this.assignNewPeerReviews()
							})
					})
			})
	}

	handleAnalyzeClick() {
		console.log("handle analyze click")
		this.setState({
			analyzePressed: true,
		})
	}

	handleFinalizeClick() {
		console.log("handle finalize click")
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

	sendIncompleteMessages() {
		console.log("3: fetching peer review data from canvas")

		var data = {
			course_id: this.course_id,
			assignment_id: this.assignment_id,
			assignment_name: this.assignment_info.name,
			points_possible: this.assignment_info.points_possible,
		}


		fetch('/api/save_all_peer_reviews', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(() => {
				fetch('/api/send_incomplete_messages', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data),
				})
			})
	}

	componentDidMount() {
		console.log("mounted")

		if (localStorage.getItem("analyzePressed_" + this.assignment_id)) {
			console.log("found saved analyze pressed history")
			this.setState({
				analyzeDisplayText: true,
			})

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
			.then(response => {
				if (response.status == 200) {
					this.setState({
						finalizeDisplayText: true,
						finalizePressed: true,
					})
				}
			})

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_1")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_1");
			var new_date = new Date(formatted_date)

			this.deadline_1 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_2")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_2");
			var new_date = new Date(formatted_date)

			this.deadline_2 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_3")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_3");
			var new_date = new Date(formatted_date)

			this.deadline_3 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("sendIncompleteMessages_" + this.assignment_id)) {
			if (!this.state.sendIncompleteMessages) {
				this.setState({
					sendIncompleteMessages: true,
				})
			}
		}
		if (localStorage.getItem("custom_benchmarks_" + this.assignment_id)) {
			if (!this.state.custom_benchmarks) {
				this.setState({
					custom_benchmarks: true,
				})
			}
		}
		if (localStorage.getItem("penalizing_for_incompletes_" + this.assignment_id)) {
			if (!this.state.penalizing_for_incompletes) {
				this.setState({
					penalizing_for_incompletes: true,
				})
			}
		}
		if (localStorage.getItem("penalizing_for_reassigned_" + this.assignment_id)) {
			if (!this.state.penalizing_for_reassigned) {
				this.setState({
					penalizing_for_reassigned: true,
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
		

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_1")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_1");
			var new_date = new Date(formatted_date)

			this.deadline_1 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_2")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_2");
			var new_date = new Date(formatted_date)

			this.deadline_2 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.assignment_id + "_3")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.assignment_id + "_3");
			var new_date = new Date(formatted_date)

			this.deadline_3 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}
		if (localStorage.getItem("sendIncompleteMessages_" + this.assignment_id)) {
			if (!this.state.sendIncompleteMessages) {
				this.setState({
					sendIncompleteMessages: true,
				})
			}
		}
		if (localStorage.getItem("custom_benchmarks_" + this.assignment_id)) {
			if (!this.state.custom_benchmarks) {
				this.setState({
					custom_benchmarks: true,
				})
			}
		}
		if (localStorage.getItem("penalizing_for_incompletes_" + this.assignment_id)) {
			if (!this.state.penalizing_for_incompletes) {
				this.setState({
					penalizing_for_incompletes: true,
				})
			}
		}
		if (localStorage.getItem("penalizing_for_reassigned_" + this.assignment_id)) {
			if (!this.state.penalizing_for_reassigned) {
				this.setState({
					penalizing_for_reassigned: true,
				})
			}
		}
	}

	render() {
		
		return (
			<div>
				{
					!this.state.finalizePressed ?
						<div className="assignment-info-content">
							<DueDate name="Due Date 1" assignment_id={this.assignment_id} number="1" message={message1} />
							{localStorage.getItem("calendarDate_" + this.assignment_id + "_1") ?
								<DueDate name="Due Date 2" assignment_id={this.assignment_id} number="2" message={message2} />
								:
								null
							}
							{localStorage.getItem("calendarDate_" + this.assignment_id + "_1") && localStorage.getItem("calendarDate_" + this.assignment_id + "_2") ?
								<DueDate name="Due Date 3" assignment_id={this.assignment_id} number="3" message={message3} />
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
							<Flexbox className="flex-dropdown" width="300px" flexWrap="wrap" justify-content="space-around"  >
								{this.state.custom_benchmarks ?
									<div>
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.WIDTH_OF_STD_DEV_RANGE} min={0} step={0.01} placeholder="WIDTH_OF_STD_DEV_RANGE" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.THRESHOLD} min={0} step={.0001} placeholder="THRESHOLD" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.COULD_BE_LOWER_BOUND} min={0} max={1} step={.01} placeholder="COULD_BE_LOWER_BOUND" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.COULD_BE_UPPER_BOUND} min={1} max={5} step={.01} placeholder="COULD_BE_UPPER_BOUND" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION} min={0} step={1} placeholder="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION} min={0} step={1} placeholder="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING} min={0} step={1} placeholder="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" />
										<AlgorithmBenchmarks value={this.state.algorithm_benchmarks.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING} min={0} max={1} step={.001} placeholder="MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" />
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
							{console.log("finalize pressed")}
							<FinalizeResults penalizing_for_incompletes={this.state.penalizing_for_incompletes} penalizing_for_reassigned={this.state.penalizing_for_reassigned} assignment_info={this.assignment_info} course_id={this.course_id} assignment_id={this.assignment_id} pressed={true} benchmarks={this.state.algorithm_benchmarks}
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
							<FinalizeResults penalizing_for_incompletes={this.state.penalizing_for_incompletes} penalizing_for_reassigned={this.state.penalizing_for_reassigned} assignment_info={this.assignment_info} course_id={this.course_id} assignment_id={this.assignment_id} pressed={false} benchmarks={this.state.algorithm_benchmarks} progress={100}
							/>
						</div>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzeDisplayText ?
						<AnalyzeResults assignment_info={this.assignment_info} course_id={this.course_id} assignment_id={this.assignment_id} pressed={false} benchmarks={this.state.algorithm_benchmarks}
						/>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzePressed ?
						<div>
							<AnalyzeResults assignment_info={this.assignment_info} course_id={this.course_id} assignment_id={this.assignment_id} pressed={true} benchmarks={this.state.algorithm_benchmarks}
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
							{console.log("due date 1")}
							{this.sendIncompleteMessages()}
						</div>
						:
						null
				}
				{
					this.deadline_2 != null && this.deadline_2 == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_old_peer_reviews ?
						<div>
							{console.log("due date 2")}
							{this.deleteOldPeerReviews()}
						</div>
						:
						null
				}
				{
					this.deadline_3 != null && this.deadline_3 == this.state.curr_time && !this.state.finalizePressed ?
						<div>
							{console.log("due date 3")}
							{this.handleFinalizeClick()}
						</div>
						:
						null
				}
			</div>
		)
	}
}
export default AnalyzeButton;
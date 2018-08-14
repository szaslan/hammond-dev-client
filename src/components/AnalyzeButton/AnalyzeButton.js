import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import '../Assignments/Assignments.css';
import FinalizeResults from '../FinalizeResults/FinalizeResults';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import DueDate from '../DueDate/DueDate';
import moment from 'moment';

import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';

//var message1 = "Click the button to set the first due date. This due date represents when all peer reviews are due by. Any peer review submitted to Canvas after this date will be considered late. At the time of the due date, all peer reviews are downloaded from Canvas. Any student who has not yet completed all their peer reviews for the assignment will get a Canvas message reminding them that they are now late and still need to complete x number of peer reviews.";
var message1 = "Peer reviews submitted after this date will be considered late. Any student who has not submitted reviews by this date will receive a notification message from Canvas.";
//var message2 = "Click the button to set the second due date. This due date represents the last point to submit late peer reviews. Once this deadline passes, all incomplete peer reviews will be deleted from Canvas, preventing students from submitting them. In addition, those incomplete peer reviews will be reassigned to other students. The pool of students to pick from for reassignment is all students who were deemed could be harsh, could be lenient, could be fair, or definitely fair, had completed all of their reviews for this assignment, and had not already reviewed the person for this assignment. From this pool of people, one student is randomly selected and given this new peer review. In addition, a message is sent to each student who is given more peer reviews, letting them know that they have done such a great job in the past, that they have to cover for slackers."
var message2 = "Late peer reviews submitted after this date will be reassigned to students who have completed all of their reviews for this assignment.";
//var message3 = "Click the button to set the third due date. This due date represents the deadline for reassigned peer reviews. Once this deadline passes, the 'finalize' button is pressed. This results in a grade for each submission being calculated by the grading algorithm and automatically sent to the Canvas gradebook. If you do not want the grades to be published immediately, ensure that you have muted the assignment on Canvas before this point."
var message3 = "Reassigned peer reviews must be submitted by this deadline. After this date, any unsubmitted peer reviews will be deleted from Canvas.";

class AnalyzeButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
			analyzePressed: false,
			finalizePressed: false,
			analyzeDisplayText: false,
			finalizeDisplayText: false,
			curr_time: null,
			assigned_new_peer_reviews: false,
			deleted_old_peer_reviews: false,
			tooltipOpen1: false,
			tooltipOpen2: false,
			sendIncompleteMessages: false,
			custom_benchmarks: false,
			penalizing_for_incompletes: false,
			penalizing_for_reassigned: false,

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
		};

		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);
		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.deleteOldPeerReviews = this.deleteOldPeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.deadline_1 = null;
		this.deadline_2 = null;
		this.deadline_3 = null;
	}

	sendIncompleteMessages() {
		console.log("3: fetching peer review data from canvas")

		var data = {
			course_id: this.props.course_id,
			assignment_id: this.props.assignment_id,
			assignment_name: this.props.assignment_info.name,
			points_possible: this.props.assignment_info.points_possible,
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

	assignNewPeerReviews() {
		this.setState({ assigned_new_peer_reviews: true })

		var data = {
			assignment_id: this.props.assignment_id,
			course_id: this.props.course_id,
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
			course_id: this.props.course_id,
			assignment_id: this.props.assignment_id,
			points_possible: this.props.assignment_info.points_possible,
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
			})
			.then(() => {
				this.setState({ deleted_old_peer_reviews: true })

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
	}

	handleAnalyzeClick() {
		console.log("handle analyze click")
		this.setState({ analyzePressed: true })
	}

	handleFinalizeClick() {
		console.log("handle finalize click")
		this.setState({ finalizePressed: true })
	}

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		if (value) {
			localStorage.setItem(name + "_" + this.props.assignment_id, value)
		}
		else {
			localStorage.removeItem(name + "_" + this.props.assignment_id)
		}

		this.setState({
			[name]: value
		});
	}

	componentDidMount() {
		console.log("mounted")

		if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
			console.log("found saved analyze pressed history")
			this.setState({
				analyzeDisplayText: true
			})

			if (localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id) && localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id) == "All reviews accounted for") {
				console.log("all peer reviews are in, so we can finalize this assignment")
				// this.handleFinalizeClick()
			}
		}

		let data = {
			assignment_id: this.props.assignment_id
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
						finalizePressed: true
					})
				}
			})

		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1");
			var new_date = new Date(formatted_date)

			this.deadline_1 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2");
			var new_date = new Date(formatted_date)

			this.deadline_2 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3");
			var new_date = new Date(formatted_date)

			this.deadline_3 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("sendIncompleteMessages_" + this.props.assignment_id)) {
			if (!this.state.sendIncompleteMessages) {
				this.setState({ sendIncompleteMessages: true })
			}
		}
		if (localStorage.getItem("custom_benchmarks_" + this.props.assignment_id)) {
			if (!this.state.custom_benchmarks) {
				this.setState({ custom_benchmarks: true })
			}
		}
		if (localStorage.getItem("penalizing_for_incompletes_" + this.props.assignment_id)) {
			if (!this.state.penalizing_for_incompletes) {
				this.setState({
					penalizing_for_incompletes: true
				})
			}
		}
		if (localStorage.getItem("penalizing_for_reassigned_" + this.props.assignment_id)) {
			if (!this.state.penalizing_for_reassigned) {
				this.setState({
					penalizing_for_reassigned: true
				})
			}
		}



		setInterval(() => {
			this.setState({
				curr_time: new Date().toLocaleString()
			})
		},
			1000
		)
	}

	componentDidUpdate() {
		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1");
			var new_date = new Date(formatted_date)

			this.deadline_1 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2");
			var new_date = new Date(formatted_date)

			this.deadline_2 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}

		if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3")) {
			let formatted_date = localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3");
			var new_date = new Date(formatted_date)

			this.deadline_3 = moment(new_date).format('l') + ", " + moment(new_date).format('LTS')
		}
		if (localStorage.getItem("sendIncompleteMessages_" + this.props.assignment_id)) {
			if (!this.state.sendIncompleteMessages) {
				this.setState({ sendIncompleteMessages: true })
			}
		}
		if (localStorage.getItem("custom_benchmarks_" + this.props.assignment_id)) {
			if (!this.state.custom_benchmarks) {
				this.setState({ custom_benchmarks: true })
			}
		}
		if (localStorage.getItem("penalizing_for_incompletes_" + this.props.assignment_id)) {
			if (!this.state.penalizing_for_incompletes) {
				this.setState({
					penalizing_for_incompletes: true
				})
			}
		}
		if (localStorage.getItem("penalizing_for_reassigned_" + this.props.assignment_id)) {
			if (!this.state.penalizing_for_reassigned) {
				this.setState({
					penalizing_for_reassigned: true
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
							<DueDate name="Due Date 1" assignment_id={this.props.assignment_id} number="1" message={message1} />
							{localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") ?
								<DueDate name="Due Date 2" assignment_id={this.props.assignment_id} number="2" message={message2} />
								:
								null
							}
							{localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") && localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2") ?
								<DueDate name="Due Date 3" assignment_id={this.props.assignment_id} number="3" message={message3} />
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
							<FinalizeResults penalizing_for_incompletes={this.state.penalizing_for_incompletes} penalizing_for_reassigned={this.state.penalizing_for_reassigned} assignment_info={this.props.assignment_info} course_id={this.props.course_id} assignment_id={this.props.assignment_id} pressed={true} benchmarks={this.state.algorithm_benchmarks}
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
							<FinalizeResults penalizing_for_incompletes={this.state.penalizing_for_incompletes} penalizing_for_reassigned={this.state.penalizing_for_reassigned} assignment_info={this.props.assignment_info} course_id={this.props.course_id} assignment_id={this.props.assignment_id} pressed={false} benchmarks={this.state.algorithm_benchmarks} progress={100}
							/>
						</div>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzeDisplayText ?
						<AnalyzeResults assignment_info={this.props.assignment_info} course_id={this.props.course_id} assignment_id={this.props.assignment_id} pressed={false} benchmarks={this.state.algorithm_benchmarks}
						/>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzePressed ?
						<div>
							<AnalyzeResults assignment_info={this.props.assignment_info} course_id={this.props.course_id} assignment_id={this.props.assignment_id} pressed={true} benchmarks={this.state.algorithm_benchmarks}
							/>
							{
								this.setState({
									analyzeDisplayText: true,
									analyzePressed: false
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
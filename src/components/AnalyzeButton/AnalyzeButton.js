import React, { Component } from 'react';
import { Well, Row, Panel } from 'react-bootstrap';
import { UncontrolledTooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import Loader from 'react-loader-spinner';
import '../Assignments/Assignments.css';
import FinalizeResults from '../FinalizeResults/FinalizeResults';
import AnalyzeResults from '../AnalyzeResults/AnalyzeResults';
import DueDate from '../DueDate/DueDate';

import '../Assignments/Assignments.css'

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
		};

		this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);
		this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
		this.deleteOldPeerReviews = this.deleteOldPeerReviews.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
	}

	sendIncompleteMessages() {
		if (window.confirm('Do you want to Canvas message each student with missing peer reviews?')) {
			var data = {
				course_id: this.props.course_id,
				assignment_id: this.props.assignment_id,
				assignment_name: this.props.assignment_info.name,
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
					fetch('/api/send_incomplete_messages', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(data),
					})
				})
		}
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

	componentDidMount() {
		console.log("mounted")

		if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
			console.log("found saved analyze pressed history")
			this.setState({
				analyzeDisplayText: true
			})
		}

		if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
			console.log("found saved finalize pressed history")
			this.setState({
				finalizeDisplayText: true,
				finalizePressed: true
			})
		}

		setInterval(() => {
			this.setState({
				curr_time: new Date().toLocaleString()
			})
		},
			1000
		)
	}

	render() {
		return (
			<div>
				{
					!this.state.finalizePressed ?
						<div className="assignment-info-content">
							<DueDate
								name="Due Date 1"
								assignment_id={this.props.assignment_id}

								number="1"
								message={message1} />
							{(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") ?
								<DueDate
									name="Due Date 2"
									assignment_id={this.props.assignment_id}
									number="2" 
      								message={message2}/>
								:
								null
							)}
{(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") &&
							localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2") ?
								<DueDate
									name="Due Date 3"
									assignment_id={this.props.assignment_id}
									number="3"
  message={message3}/>
								:
								null
							)}

						</div>
						:
						null
				}
				{
					!this.state.finalizePressed && !this.state.finalizeDisplayText ?
						<div>
							<Flexbox className="flex-dropdown" width="300px" flexWrap="wrap" justify-content="space-around"  >
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
							<FinalizeResults
								assignment_info={this.props.assignment_info}
								course_id={this.props.course_id}
								assignment_id={this.props.assignment_id}
								pressed={true}
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
								assignment_info={this.props.assignment_info}
								course_id={this.props.course_id}
								assignment_id={this.props.assignment_id}
								pressed={false}
							/>
						</div>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzeDisplayText ?
						<AnalyzeResults
							assignment_info={this.props.assignment_info}
							course_id={this.props.course_id}
							assignment_id={this.props.assignment_id}
							pressed={false}
						/>
						:
						null
				}
				{
					!this.state.finalizePressed && this.state.analyzePressed ?
						<div>
							<AnalyzeResults
								assignment_info={this.props.assignment_info}
								course_id={this.props.course_id}
								assignment_id={this.props.assignment_id}
								pressed={true}
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
					localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") != null && localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1") == this.state.curr_time ?
						<div>
							{console.log("due date 1")}
							{this.sendIncompleteMessages()}
						</div>
						:
						null
				}
				{
					localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2") != null && localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2") == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_old_peer_reviews ?
						<div>
							{console.log("due date 2")}
							{this.deleteOldPeerReviews()}
						</div>
						:
						null
				}
				{
					localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3") != null && localStorage.getItem("calendarDate_" + this.props.assignment_id + "_3") == this.state.curr_time && !this.state.finalizePressed ?
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
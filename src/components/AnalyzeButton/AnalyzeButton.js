import Flexbox from 'flexbox-react';
import history from '../../history';
import Loader from 'react-loader-spinner'
import moment from 'moment';
import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { UncontrolledTooltip } from 'reactstrap';

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
			//nextClicked: (localStorage.getItem("nextClicked_" + this.props.assignmentId) != null ? localStorage.getItem("nextClicked_" + this.props.assignmentId) : false),
			finalizeDisplayText: false,
			finalizePressed: false,
			loaded: false,
			tooltipOpen1: false,
			tooltipOpen2: false,
		};
		//localStorage.setItem("nextClicked_"+this.props.assignmentId, this.state.nextClicked);
		if (localStorage.getItem("nextClicked_" + this.props.assignmentId) == null) {
			localStorage.setItem("nextClicked_" + this.props.assignmentId, false)
		}

		this.backClick = this.backClick.bind(this);
		this.checkForPreviousAnalyzeAndFinalizePresses = this.checkForPreviousAnalyzeAndFinalizePresses.bind(this);
		this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
		this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
		this.nextClick = this.nextClick.bind(this);
		this.pullSavedBenchmarksFromLocalStorage = this.pullSavedBenchmarksFromLocalStorage.bind(this);
		this.send400Error = this.send400Error.bind(this);
		this.send401Error = this.send401Error.bind(this);
		this.send404Error = this.send404Error.bind(this);
		this.setTime = this.setTime.bind(this);

		this.assignmentId = this.props.assignmentId;
		this.assignmentInfo = this.props.assignmentInfo;
		this.courseId = this.props.courseId;
		this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
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

	backClick() {
		localStorage.setItem("nextClicked_" + this.props.assignmentId, false);
		// this.setState({
		// 	nextClicked: false
		// });
	}

	checkForPreviousAnalyzeAndFinalizePresses() {
		let data = {
			assignmentId: this.assignmentId,
			courseId: this.courseId,
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
						if (localStorage.getItem("analyzePressed" + this.localStorageExtension) === "true") {
							this.setState({
								analyzeDisplayText: true,
							})

							//To automatically finalize if all peer reviews are in
							if (localStorage.getItem("analyzeDisplayTextMessage" + this.localStorageExtension) === "All reviews accounted for" && localStorage.getItem("automaticallyFinalize" + this.localStorageExtension) === "true") {
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
			})
	}

	handleAnalyzeClick() {
		this.setState({
			analyzePressed: true,
		})
	}

	handleFinalizeClick() {
		localStorage.setItem("finalized" + this.localStorageExtension, this.state.currTime)
		this.setState({
			finalizePressed: true,
		})
	}

	nextClick() {
		localStorage.setItem("nextClicked_" + this.props.assignmentId, true);
		// this.setState({
		// 	nextClicked: true
		// });
		//localStorage.setItem("nextClicked_" + this.assignmentId, this.state.nextClicked);
	}

	pullSavedBenchmarksFromLocalStorage() {
		benchmarkNames.forEach((benchmark, index, array) => {
			let value = localStorage.getItem(benchmark + this.localStorageExtension);
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
		this.pullSavedBenchmarksFromLocalStorage();

		//To automatically finalize if all peer reviews are in
		if (localStorage.getItem("analyzeDisplayTextMessage" + this.localStorageExtension) === "All reviews accounted for" && !this.state.finalizePressed && localStorage.getItem("automaticallyFinalize" + this.localStorageExtension) === "true") {
			console.log("all peer reviews are in, so we can finalize this assignment")
			this.handleFinalizeClick()
		}
	}

	render() {
		
		
		if (this.state.loaded) {
			return (
				<div>
					{
						!this.state.finalizePressed ?
							<div className="assignment-info-content">
								<div className={"calendar-case" + (!localStorage.getItem("nextClicked_" + this.props.assignmentId) ? "-hidden" : "")}>
									{/* <div className={"calendar-case" + (this.state.nextClicked ? "-hidden" : "")}> */}
									{/* <div className={"calendar-case" + (nextClicked ? "-hidden" : "")}> */}
									<p className="header-text">Set Due Date:</p>
									<Flexbox flexWrap="wrap">
										<NewDueDate number="1" assignmentId={this.assignmentId} courseId={this.courseId} textDescription={message1} />
										<NewDueDate number="2" assignmentId={this.assignmentId} courseId={this.courseId} textDescription={message2} />
										<NewDueDate number="3" assignmentId={this.assignmentId} courseId={this.courseId} textDescription={message3} />
									</Flexbox>
									<button className="switch-button next-button" disabled={!localStorage.getItem("dueDate3" + this.localStorageExtension) || localStorage.getItem("dueDate3" + this.localStorageExtension) == "N/A"} onClick={this.nextClick}>
										Next
									</button>

								</div>

								<div className={"parameters-case" + (!localStorage.getItem("nextClicked_" + this.props.assignmentId) ? "" : "-hidden")}>
									{/* <div className={"parameters-case" + (this.state.nextClicked ? "" : "-hidden")}> */}
									{/* <div className={"parameters-case" + (nextClicked ? "" : "-hidden")}> */}
									<CustomizableParameters assignmentId={this.assignmentId} courseId={this.courseId} userInputBenchmarks={this.userInputBenchmarks} />

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

									<button className="switch-button back-button" onClick={this.backClick}>
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
										benchmarks={localStorage.getItem("customBenchmarks" + this.localStorageExtension) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
										courseId={this.courseId}
										penalizingForOriginalIncompletes={localStorage.getItem("penalizingForOriginalIncompletes" + this.localStorageExtension) === "true" ? true : false}
										penalizingForReassignedIncompletes={localStorage.getItem("penalizingForReassignedIncompletes" + this.localStorageExtension) === "true" ? true : false}
									/>
								</div>
								:
								//running algorithm
								<div >
									<FinalizeResults
										assignmentId={this.assignmentId}
										assignmentInfo={this.assignmentInfo}
										benchmarks={localStorage.getItem("customBenchmarks" + this.localStorageExtension) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
										courseId={this.courseId}
										penalizingForOriginalIncompletes={localStorage.getItem("penalizingForOriginalIncompletes" + this.localStorageExtension) === "true" ? true : false}
										penalizingForReassignedIncompletes={localStorage.getItem("penalizingForReassignedIncompletes" + this.localStorageExtension) === "true" ? true : false}
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
												benchmarks={localStorage.getItem("customBenchmarks" + this.localStorageExtension) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
												courseId={this.courseId}
												pressed={true}
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
											assignmentInfo={this.assignmentInfo}
											benchmarks={localStorage.getItem("customBenchmarks" + this.localStorageExtension) === "true" ? this.userInputBenchmarks : defaultBenchmarks}
											courseId={this.courseId}
											pressed={false}
										/>
										:
										null
								}
							</div>
					}
				</div>
			)
		}

		return (
			<Loader type="TailSpin" color="black" height={80} width={80} />
		)
	}
}

export default AnalyzeButton;
export { benchmarkNames, defaultBenchmarks };
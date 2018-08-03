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

import '../Assignments/Assignments.css'


class AnalyzeButton extends Component {
	constructor(props) {
		super(props);

		var deadline_1 = new Date(2018, 7, 1, 15, 13, 0).toLocaleString();
		let deadline_2 = new Date(2018, 7, 1, 15, 14, 0).toLocaleString();
		let deadline_3 = new Date(2018, 7, 1, 15, 15, 0).toLocaleString();

		this.state = {
			analyzePressed: false,
			finalizePressed: false,
			analyzeDisplayText: false,
			finalizeDisplayText: false,
			curr_time: null,
			deadlines: {
				deadline_1: deadline_1,
				deadline_2: deadline_2,
				deadline_3: deadline_3
			},
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
		this.unpressAnalyze = this.unpressAnalyze.bind(this);
	}
  
  
  toggle() {
    this.setState({
      tooltipOpen1: !this.state.tooltipOpen1,
      tooltipOpen2: !this.state.tooltipOpen2
    })
  }

	sendIncompleteMessages() {
		if (window.confirm('Do you want to Canvas message each student with missing peer reviews?')) {
			var data = {
				assignment_id: this.props.assignment_id,
				assignment_name: this.props.assignment_info.name,
				course_id: this.props.course_id,
			}

			fetch('/api/send_incomplete_messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data),
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
		this.setState({ deleted_old_peer_reviews: true })

		var data = {
			assignment_id: this.props.assignment_id,
			course_id: this.props.course_id,
		}

		fetch('/api/delete_peer_reviews', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
		})
	}

	handleAnalyzeClick() {
		this.setState({ analyzePressed: true })
	}

	handleFinalizeClick() {
		this.setState({ finalizePressed: true })
	}

	unpressAnalyze() {
		this.setState({
			analyzePressed: false
		})
	}

	componentDidMount() {
		console.log("mounted")

		if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
			this.setState({
				analyzeDisplayText: true
			})
		}

		if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
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
					!this.state.finalizePressed && !this.state.finalizeDisplayText ?
              <div>
            <Flexbox className="flex-dropdown" minWidth="600px" flexWrap="wrap" justify-content="space-around"  >
              <span id="analyze-button-1">
                <button onClick={this.handleClick} className="analyze" id="analyze">Analyze</button>
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
              {/* <Tooltip placement="top" delay={{ show: "1200" }} isOpen={this.state.tooltipOpen2} target="finalize-button-1" toggle={this.toggle}>
                Click to send grades to gradebook on Canvas
              </Tooltip> */}
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
					this.state.deadlines.deadline_1 == this.state.curr_time ?
						this.sendIncompleteMessages()
						:
						null
				}
				{
					this.state.deadlines.deadline_2 == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_old_peer_reviews ?
						<div>
							{this.deleteOldPeerReviews()}
							{this.assignNewPeerReviews()}
						</div>
						:
						null
				}
				{
					this.state.deadlines.deadline_3 == this.state.curr_time && !this.state.finalizePressed ?
						this.handleFinalizeClick()
						:
						null
				}
			</div>
		)
	}
}
export default AnalyzeButton;
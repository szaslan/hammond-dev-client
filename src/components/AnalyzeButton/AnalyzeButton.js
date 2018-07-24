import React, { Component } from 'react';
import { Well, Row, Panel } from 'react-bootstrap';

import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import '../Assignments/Assignments.css'

const HARSHNAME = ['James','Elizabeth','John'];

var message = "";

class AnalyzeButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonPressed: false,
      analyzeDisplayText: false,
      finalizeDisplayText: false,
      peerreviewJSON: [],
      rubricJSON: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
    this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this);
    this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
    this.fetchRubricData = this.fetchRubricData.bind(this);
    this.attachNamesToDatabaseTables = this.attachNamesToDatabaseTables.bind(this);
  }

  fetchPeerReviewData(finalizing) {
    console.log("3: fetching peer review data from canvas")
    fetch(`https://canvas.northwestern.edu/api/v1/courses/${this.props.course_id}/assignments/${this.props.assignment_id}/peer_reviews?access_token=${this.props.apiKey}`)
    .then(res => {
        res.json()
        .then(data => {
            this.setState({peerreviewJSON: data})
            fetch('/api/save_all_peer_reviews', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.peerreviewJSON)
            })
            .then(() => {
                this.fetchRubricData(finalizing);
            })
        })
    })
  }

  fetchRubricData(finalizing) {
    console.log("5: fetching rubric data from canvas");
    fetch(`https://canvas.northwestern.edu/api/v1/courses/${this.props.course_id}/rubrics/${this.props.assignment_info.rubric_settings.id}?access_token=${this.props.apiKey}&include=peer_assessments`)
    .then(res => {
        res.json()
        .then(data => {
            this.setState({rubricJSON: data})
            if (finalizing) {
              fetch('/api/save_all_rubrics', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.rubricJSON)
              })
              .then(() => {
                fetch('/api/peer_reviews_finalizing', {
                  method: 'GET',
                })
                .then(res => res.json())
                .then(res => message = res.message)
                .then(() => this.sendGradesToCanvas())
                .then(() => this.setState({analyzeDisplayText: false}))
                .then(() => this.setState({finalizeDisplayText: true}))
                .then(() => document.getElementById("analyze").disabled = true)
                .then(() => document.getElementById("finalize").disabled = true)
                .then(() => this.attachNamesToDatabaseTables())
              })
            }
            else {
              fetch('/api/save_all_rubrics', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.rubricJSON)
              })
              .then(() => {
                fetch('/api/peer_reviews_analyzing', {
                  method: 'GET',
                })
                .then(res => res.json())
                .then(res => message = res.message)
                .then(() => this.setState({analyzeDisplayText: true}))
                .then(() => this.setState({finalizeDisplayText: false}))
                .then(() => this.attachNamesToDatabaseTables())
              })
            }
        })
    })
  }

  sendGradesToCanvas() {
    console.log("8: sending grades to canvas");
    var data = {
        course_id: this.props.course_id,
        assignment_id: this.props.assignment_id,
        apiKey: this.props.apiKey
    }

    fetch('/api/send_grades_to_canvas', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
  }

  attachNamesToDatabaseTables() {
    console.log("10: attaching names to database tables");
    var data = {
        course_id: this.props.course_id,
        apiKey: this.props.apiKey
    }

    fetch('/api/attach_names_in_database', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  }

  handleClick() {
    console.log("2: button clicked")
    this.setState(prevState => ({
      buttonPressed: !prevState.buttonPressed
    }));
    this.fetchPeerReviewData(false);
  }

  handleFinalizeClick() {
    console.log("2: button clicked")
    this.fetchPeerReviewData(true);
  }

  render() {
    return (
      <div>
        <Flexbox className="flex-dropdown" maxWidth="300px" flexWrap="wrap" justify-content="space-around"  >
          <button onClick={this.handleClick} className="analyze" id="analyze">
            Analyze
          </button>
          <button className="analyze" id="finalize" onClick={this.handleFinalizeClick}>Finalize</button>
        </Flexbox>
        {this.state.finalizeDisplayText ?
          <div>
            <strong>Completed Peer Reviews:</strong> {message.num_completed} / {message.num_assigned}
            <br></br>
            <strong>Average Grade:</strong> {message.average} / {message.out_of}
          </div>
          :
          null
        }
        {
          this.state.analyzeDisplayText ?
            <div>
              <div>
                {message.message}
              </div>
              <div>
                <Row>
                  <Well className="well2">
                    <strong>Completed Peer Reviews:</strong> {message.num_completed} / {message.num_assigned}
                    <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                      <Accordion name="Definitely Harsh" content={HARSHNAME} />
                      <Accordion name="Definitely Lenient"  />
                      <Accordion name="Missing Peer Reviews" content={HARSHNAME}/>
                    </Flexbox>
                  </Well>
                </Row>
              </div>
            </div>
            :
            <Row>
            </Row>
          
        }
      </div>
    )
  }
}
export default AnalyzeButton;





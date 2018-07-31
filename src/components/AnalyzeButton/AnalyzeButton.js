import React, { Component } from 'react';
import { Well, Row, Panel } from 'react-bootstrap';

import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import Loader from 'react-loader-spinner'

import '../Assignments/Assignments.css'

var message = "";

class AnalyzeButton extends Component {
  constructor(props) {

    super(props);
        
    
    this.state = {
      buttonPressed: false,
      analyzeDisplayText: false,
      finalizeDisplayText: false,
      finalizePressed: false,
      peerreviewJSON: [],
      rubricJSON: [],
      harsh_students: [],
      lenient_students: [],
      incomplete_students: [],
      harsh_students_loaded: false,
      lenient_students_loaded: false,
      incomplete_students_loaded: false,

    };

    this.handleClick = this.handleClick.bind(this);
    this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
    this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this);
    this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
    this.fetchRubricData = this.fetchRubricData.bind(this);
    this.attachNamesToDatabaseTablesAnalyzing = this.attachNamesToDatabaseTablesAnalyzing.bind(this);
    this.attachNamesToDatabaseTablesFinalizing = this.attachNamesToDatabaseTablesFinalizing.bind(this)
    this.sortStudentsForAccordion = this.sortStudentsForAccordion.bind(this);
  }



  fetchPeerReviewData(finalizing) {
    if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
      this.setState({analyzeDisplayText: false})
      this.setState({finalizePressed: true})
      this.setState({finalizeDisplayText: true})
    }
    else {
      let outerData = {
        course_id: this.props.course_id,
        assignment_id: this.props.assignment_id
      }
      console.log("3: fetching peer review data from canvas")
      fetch('/api/save_all_peer_reviews_outer', {
        method: "POST",
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outerData)
      })
      .then(res => {
        res.json()
        .then(result => {
          this.setState({peerreviewJSON: result})

          var data = {
            peer_reviews: this.state.peerreviewJSON,
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id,
            points_possible: this.props.assignment_info.points_possible,
          }

          fetch('/api/save_all_peer_reviews', {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(() => {
            this.fetchRubricData(finalizing);
          })
        })
      })
      .then(() => {
        if (finalizing) {
          localStorage.setItem("finalizePressed_" + this.props.assignment_id, true);
          this.setState({analyzeDisplayText: false})
          this.setState({finalizePressed: true})
          this.setState({finalizeDisplayText: true})
        }
        else {
          localStorage.setItem("analyzePressed_" + this.props.assignment_id, true);
        }
      })
    }
  }

  fetchRubricData(finalizing) {

    let data = {
      course_id: this.props.course_id,
      rubric_settings: this.props.assignment_info.rubric_settings.id
    }

    console.log("5: fetching rubric data from canvas");
    fetch('/api/save_all_rubrics_outer',{
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    })
    .then(res => {
        res.json()
        .then(data => {
            this.setState({rubricJSON: data})
            console.log(data)
            if (finalizing) {
              var data = {
                rubrics: this.state.rubricJSON,
                assignment_id: this.props.assignment_id,
              }

              fetch('/api/save_all_rubrics', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              })
              .then(() => {
                var data = {
                  assignment_id: this.props.assignment_id,
                  points_possible: this.props.assignment_info.points_possible,
                }
                fetch('/api/peer_reviews_finalizing', {
                  method: 'POST',
                  headers:{
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data),
                })
                .then(res => res.json())
                .then(res => message = res.message)
                .then(() => {
                  localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id, message.num_completed);
                  localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id, message.num_assigned);
                  localStorage.setItem("finalizeDisplayTextAverage_" + this.props.assignment_id, message.average);
                  localStorage.setItem("finalizeDisplayTextOutOf_" + this.props.assignment_id, message.out_of);
                })
                .then(() => this.sendGradesToCanvas())
                .then(() => this.setState({analyzeDisplayText: false}))
                .then(() => this.setState({finalizeDisplayText: true}))
                .then(() => this.attachNamesToDatabaseTablesFinalizing())
              })
            }
            else {
              var data = {
                rubrics: this.state.rubricJSON,
                assignment_id: this.props.assignment_id,
              }

              fetch('/api/save_all_rubrics', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              })
              .then(() => {
                fetch('/api/peer_reviews_analyzing', {
                  method: 'POST',
                  headers:{
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(res => message = res.message)
                .then(() => {
                  localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.props.assignment_id, message.num_completed);
                  localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.props.assignment_id, message.num_assigned);
                  localStorage.setItem("analyzeDisplayTextMessage_" + this.props.assignment_id, message.message);
                })
                .then(() => this.setState({analyzeDisplayText: true}))
                .then(() => this.setState({finalizeDisplayText: false}))
                .then(() => this.attachNamesToDatabaseTablesAnalyzing())
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

  attachNamesToDatabaseTablesFinalizing() {
    console.log("10f: attaching names to database tables");
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
    .then(() => this.sortStudentsForAccordion())
  }

  attachNamesToDatabaseTablesAnalyzing() {
    console.log("10a: attaching names to database tables");
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
    .then(() => {
      var data = {
        assignment_id: this.props.assignment_id,
        assignment_name: this.props.assignment_info.name
      }
      
      fetch('/api/send_incomplete_messages', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
    })
  }

  componentDidMount(){
    console.log("mounted")
    if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
  
      this.setState({analyzeDisplayText: true})
      this.setState({finalizeDisplayText: false})
    }
    if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
      this.setState({analyzeDisplayText: false})
      this.setState({finalizePressed: true})
      this.setState({finalizeDisplayText: true})
    }

    if (localStorage.getItem("harsh_students_" + this.props.assignment_id) != null) {
      this.setState({
        harsh_students: JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignment_id)),
        lenient_students: JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignment_id)),
        incomplete_students: JSON.parse(localStorage.getItem("incomplete_students_" + this.props.assignment_id))
      })

      this.setState({
        harsh_students_loaded: true,
        lenient_students_loaded: true,
        incomplete_students_loaded: true
      })
    }
  }

  sortStudentsForAccordion() {
    console.log("12: sorting students for accordion")
    var data = {
      assignment_id: this.props.assignment_id,
    }
    
    fetch('/api/sort_students_for_accordion', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(res => {
      localStorage.setItem("harsh_students_" + this.props.assignment_id, JSON.stringify(res.all_students.harsh_students))
      localStorage.setItem("lenient_students_" + this.props.assignment_id, JSON.stringify(res.all_students.lenient_students))
      localStorage.setItem("incomplete_students_" + this.props.assignment_id, JSON.stringify(res.all_students.incomplete_students))
      this.setState({
        harsh_students: res.all_students.harsh_students,
        lenient_students: res.all_students.lenient_students,
        incomplete_students: res.all_students.incomplete_students
      })
      this.setState({
        harsh_students_loaded: true,
        lenient_students_loaded: true,
        incomplete_students_loaded: true
      })
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
        {this.state.finalizePressed ?
          null
          :
          <div>
            <Flexbox className="flex-dropdown" maxWidth="300px" flexWrap="wrap" justify-content="space-around"  >
            <button onClick={this.handleClick} className="analyze" id="analyze">
              Analyze
            </button>
            <button className="analyze" id="finalize" onClick={this.handleFinalizeClick}>Finalize</button>
            </Flexbox>
          </div>
        }

        {this.state.finalizeDisplayText ?
          <div>
            <strong>Completed Peer Reviews:</strong> {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}
            <br></br>
            <strong>Average Grade:</strong> {localStorage.getItem("finalizeDisplayTextAverage_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextOutOf_" + this.props.assignment_id)}
            
            {this.state.harsh_students_loaded && this.state.lenient_students_loaded && this.state.incomplete_students_loaded ? 
              <Row>
                <Well className="well2">
                  <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                      <Accordion name="Definitely Harsh" content={this.state.harsh_students}/>
                      <Accordion name="Definitely Lenient" content={this.state.lenient_students}/>
                      <Accordion name="Missing Peer Reviews" content={this.state.incomplete_students}/>
                  </Flexbox>
                </Well>
              </Row>
              :
              <Loader type="TailSpin" color="black" height={80} width={80} />
            }
          </div>
          :
          null
        }
        {
          this.state.analyzeDisplayText ?
            <div>
              <div>
              {localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id)}
              </div>
              <div>
                <Row>
                  <Well className="well2">
                    <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.props.assignment_id)}
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





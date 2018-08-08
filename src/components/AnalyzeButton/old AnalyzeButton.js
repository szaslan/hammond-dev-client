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
        
    var deadline_1 = new Date(2018, 7, 1, 15, 13, 0).toLocaleString();
    let deadline_2 = new Date(2018, 7, 1, 15, 14, 0).toLocaleString();
    let deadline_3 = new Date(2018, 7, 1, 15, 15, 0).toLocaleString();
    
    this.state = {
      text: {
        analyzeDisplayText: false,
        finalizeDisplayText: false,
      },
      finalizePressed: false,
      peerreviewJSON: [],
      rubricJSON: [],
      students: {
        harsh_students: [],
        lenient_students: [],
        incomplete_students: [],
        flagged_students: [],
      },
      students_loaded: {
        harsh_students_loaded: false,
        lenient_students_loaded: false,
        incomplete_students_loaded: false,
        flagged_students_loaded: false,
      },
      curr_time: null,
      deadlines: {
        deadline_1: deadline_1,
        deadline_2: deadline_2,
        deadline_3: deadline_3
      },
      assigned_new_peer_reviews: false,
      deleted_old_peer_reviews: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleFinalizeClick = this.handleFinalizeClick.bind(this);
    this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this);
    this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
    this.fetchRubricData = this.fetchRubricData.bind(this);
    this.attachNamesToDatabaseTablesAnalyzing = this.attachNamesToDatabaseTablesAnalyzing.bind(this);
    this.attachNamesToDatabaseTablesFinalizing = this.attachNamesToDatabaseTablesFinalizing.bind(this)
    this.sortStudentsForAccordion = this.sortStudentsForAccordion.bind(this);
    this.findFlaggedGrades = this.findFlaggedGrades.bind(this);
    this.sendIncompleteMessages = this.sendIncompleteMessages.bind(this);
    this.assignNewPeerReviews = this.assignNewPeerReviews.bind(this);
    this.deleteOldPeerReviews = this.deleteOldPeerReviews.bind(this);
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
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
    }
  }

  assignNewPeerReviews() {
    this.setState({assigned_new_peer_reviews: true})

    var data = {
      assignment_id: this.props.assignment_id,
      course_id: this.props.course_id,
    }
    
    fetch('/api/assign_new_peer_reviews', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  }

  deleteOldPeerReviews() {
    this.setState({deleted_old_peer_reviews: true})

    var data = {
      assignment_id: this.props.assignment_id,
      course_id: this.props.course_id,
    }
    
    fetch('/api/delete_peer_reviews', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  }

  fetchPeerReviewData(finalizing) {
    if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
      this.setState({
        text: {
          analyzeDisplayText: false,
          finalizeDisplayText: true
        },
        finalizePressed: true,
      })
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
          this.setState({
            text: {
              analyzeDisplayText: false,
              finalizeDisplayText: true
            },
            finalizePressed: true,
          })
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
                .then(() => {
                  this.setState({
                    text: {
                      analyzeDisplayText: false,
                      finalizeDisplayText: true
                    }
                  })
                })
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
                .then(() => {
                  this.setState({
                    text: {
                      analyzeDisplayText: true,
                      finalizeDisplayText: false
                    }
                  })
                })
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
    .then(() => {
      this.sortStudentsForAccordion()
      this.findFlaggedGrades()
    })
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
  }

  componentDidMount() {
    console.log("mounted")
    if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
  
      this.setState({
        text: {
          analyzeDisplayText: true,
          finalizeDisplayText: false
        }
      })
    }
    if (localStorage.getItem("finalizePressed_" + this.props.assignment_id)) {
      this.setState({
        text: {
          analyzeDisplayText: false,
          finalizeDisplayText: true
        },
        finalizePressed: true
      })
    }

    if (localStorage.getItem("harsh_students_" + this.props.assignment_id) != null) {
      this.setState({
        students: {
          harsh_students: JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignment_id)),
          lenient_students: JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignment_id)),
          incomplete_students: JSON.parse(localStorage.getItem("incomplete_students_" + this.props.assignment_id)),
          flagged_students: this.state.students.flagged_students,
        },
        students_loaded: {
          harsh_students_loaded: true,
          lenient_students_loaded: true,
          incomplete_students_loaded: true,
          flagged_students_loaded: this.state.students_loaded.flagged_students_loaded,
        }
      })
    }

    if (localStorage.getItem("flagged_students_" + this.props.assignment_id) != null) {
      this.setState({
        students: {
          harsh_students: this.state.students.harsh_students,
          lenient_students: this.state.students.lenient_students,
          incomplete_students: this.state.students.incomplete_students,
          flagged_students: JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignment_id))
        },
        students_loaded: {
          harsh_students_loaded: this.state.students_loaded.harsh_students_loaded,
          lenient_students_loaded: this.state.students_loaded.lenient_students_loaded,
          incomplete_students_loaded: this.state.students_loaded.incomplete_students_loaded,
          flagged_students_loaded: true,
        }
      })

    }

    setInterval( () => {
      this.setState({
        curr_time: new Date().toLocaleString()
      })
    },1000)
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
      localStorage.setItem("harsh_students_" + this.props.assignment_id, JSON.stringify(res.harsh_students))
      localStorage.setItem("lenient_students_" + this.props.assignment_id, JSON.stringify(res.lenient_students))
      localStorage.setItem("incomplete_students_" + this.props.assignment_id, JSON.stringify(res.incomplete_students))
      this.setState({
        students: {
          harsh_students: res.harsh_students,
          lenient_students: res.lenient_students,
          incomplete_students: res.incomplete_students,
          flagged_students: this.state.students.flagged_students,
        }
      })
      this.setState({
        students_loaded: {
          harsh_students_loaded: true,
          lenient_students_loaded: true,
          incomplete_students_loaded: true,
          flagged_students_loaded: this.state.students_loaded.flagged_students_loaded,
        }
      })
    })
  }

  findFlaggedGrades() {
    console.log("14: finding flagged grades")

    fetch('/api/find_flagged_grades', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      localStorage.setItem("flagged_students_" + this.props.assignment_id, JSON.stringify(res))
      this.setState({
        students: {
          harsh_students: this.state.students.harsh_students,
          lenient_students: this.state.students.lenient_students,
          incomplete_students: this.state.students.incomplete_students,
          flagged_students: res
        }
      })
      this.setState({
        students_loaded: {
          harsh_students_loaded: this.state.students_loaded.harsh_students_loaded,
          lenient_students_loaded: this.state.students_loaded.lenient_students_loaded,
          incomplete_students_loaded: this.state.students_loaded.incomplete_students_loaded,
          flagged_students_loaded: true
        }
      })
    })
  }

  handleClick() {
    console.log("2: button clicked")
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

        {this.state.text.finalizeDisplayText ?
          <div>
            <strong>Completed Peer Reviews:</strong> {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}
            <br></br>
            <strong>Average Grade:</strong> {localStorage.getItem("finalizeDisplayTextAverage_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextOutOf_" + this.props.assignment_id)}
            
            {this.state.students_loaded.harsh_students_loaded && this.state.students_loaded.lenient_students_loaded && this.state.students_loaded.incomplete_students_loaded && this.state.students_loaded.flagged_students_loaded ?
              <Row>
                <Well className="well2">
                  <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                      <Accordion name="Definitely Harsh" content={this.state.students.harsh_students}/>
                      <Accordion name="Definitely Lenient" content={this.state.students.lenient_students}/>
                      <Accordion name="Missing Peer Reviews" content={this.state.students.incomplete_students}/>
                      <Accordion name="Flagged Grades" content={this.state.students.flagged_students}/>
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
          this.state.text.analyzeDisplayText ?
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
        {
          this.state.deadlines.deadline_1 == this.state.curr_time ?
            this.sendIncompleteMessages()
            :
            null
        }
        {
          this.state.deadlines.deadline_2 == this.state.curr_time && !this.state.assigned_new_peer_reviews && !this.state.deleted_old_peer_reviews ?
            <div>
              {this.assignNewPeerReviews()}
              {this.deleteOldPeerReviews()}
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





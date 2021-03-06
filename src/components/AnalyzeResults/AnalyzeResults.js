import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { Row, Well } from 'react-bootstrap';
import history from '../../history';
import Popup from 'reactjs-popup';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';
import '../DueDate/NewDueDate.css'


var progress = 0;
var progressNumSteps = 6;
var progressBarMessage = "";

// Steps When Analyze Is Clicked Assuming Everything Works Correctly:
// 1 - progress bar reset (from componentDidMount)
// 2 - Remove all of the messages from local storage (would only exist if analyze has previously been clicked)
// 3 - call to back-end to fetch peer reviews from canvas and save to SQL tables (from savePeerReviewsFromCanvasToDatabase)
// 4 - call to back-end to run the algorithm and determine if there is enough data (from analyze)
// 5 - local storage used to save completion statitstics
// 6 - call to back-end to sync up students' names with their entries in the SQL tables (from attachNamesToDatabase)
// 7 - call to back-end to pull students' names for anyone who doesn't have enough data (from pullNamesOfFlaggedStudents)
// 8 - local storage used to save names of students who don't have enough data

class AnalyzeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false,
        }

        this.analyze = this.analyze.bind(this);
        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this);
        this.pullNamesOfFlaggedStudents = this.pullNamesOfFlaggedStudents.bind(this);
        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this);
        this.send400Error = this.send400Error.bind(this);
		this.send401Error = this.send401Error.bind(this);
		this.send404Error = this.send404Error.bind(this);
        this.setProgress = this.setProgress.bind(this);

        this.assignmentId = this.props.assignmentId;
        this.assignmentInfo = this.props.assignmentInfo;
        this.courseId = this.props.courseId;
        this.missingDataIds = [];
        this.pressed = this.props.pressed;

        this.errorMessage = "An error has occurred. Please consult the console to see what has gone wrong"
    }

    analyze() {
        var data = {
            assignmentId: this.assignmentId,
        }

        //Step 4
        fetch('/api/peerReviewsAnalyzing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(3)
                        res.json().then(res => {
                            let message = res.message;
                            this.missingDataIds = res.missingDataIds;

                            //Step 5
                            localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.assignmentId, message.numCompleted);
                            localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.assignmentId, message.numAssigned);
                            localStorage.setItem("analyzeDisplayTextMessage_" + this.assignmentId, message.message);
                            this.setProgress(4)
                            this.attachNamesToDatabase()
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called when the Analyze button is pressed after all peer reviews have been successfully fetched from Canvas and saved. This function checks if there are enough peer reviews completed for each student to accurrately calculate everyone's grade according to the either the default or customized parameters set.", res.error, "AnalyzeResults.js: analyze()", res.message)
                        })
                        break;
                    case 404:
                    this.send404Error("This function is called when the Analyze button is pressed after all peer reviews have been successfully fetched from Canvas and saved. This function checks if there are enough peer reviews completed for each student to accurrately calculate everyone's grade according to the either the default or customized parameters set.", "AnalyzeResults.js: analyze()", "No peer reviews have been assigned for this assignment on Canvas.")
                        break;
                }
            })
    }

    attachNamesToDatabase() {
        var data = {
            courseId: this.courseId,
        }

        //Step 6
        fetch('/api/attachNamesInDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(5)
                        this.pullNamesOfFlaggedStudents()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called after checking if there are enough peer reviews completed for each student. This function syncs syncs each student's actual name with all of their entries in the SQL tables", res.error, "AnalyzeResults.js: attachNamesToDatabase()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                    this.send404Error("This function is called after checking if there are enough peer reviews completed for each student. This function syncs syncs each student's actual name with all of their entries in the SQL tables", "AnalyzeResults.js: attachNamesToDatabase()", "There are no students enrolled in this course on Canvas.")
                        break;
                }
            })
    }

    pullNamesOfFlaggedStudents() {
        let data = {
            ids: this.missingDataIds,
        }

        //Step 7
        fetch('/api/getNameFromId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(6)
                        res.json().then(res => {
                            //Step 8
                            localStorage.setItem("analyzeDisplayTextNames_" + this.assignmentId, JSON.stringify(res));
                            localStorage.setItem("analyzePressed_" + this.assignmentId, true);
                            this.setProgress(7)
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called after successfully attaching each student's name to their entry in the databse. This function gathers the name of every student who does not have enough data to accurately calculate grades for them.", res.error, "AnalyzeResults.js: pullNamesOfFlaggedStudents()", res.message)
                        })
                        break;
                    case 404:
                    this.send404Error("This function is called after successfully attaching each student's name to their entry in the databse. This function gathers the name of every student who does not have enough data to accurately calculate grades for them.", "AnalyzeResults.js: pullNamesOfFlaggedStudents()", "Could not find a name for a student.")
                        break;
                }
            })
    }

    savePeerReviewsFromCanvasToDatabase() {
        let data = {
            courseId: this.courseId,
            assignmentId: this.assignmentId,
            pointsPossible: this.assignmentInfo.points_possible, //points_possible is JSON field returned from Canvas
        }

        //Step 3
        fetch('/api/saveAllPeerReviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(2)
                        this.analyze()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called when the Analyze button is pressed. This function fetches all peer review objects from Canvas and saves them to the SQL database", res.error, "AnalyzeResults.js: savePeerReviewsFromCanvasToDatabase()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                    this.send404Error("This function is called when the Analyze button is pressed. This function fetches all peer review objects from Canvas and saves them to the SQL database", "AnalyzeResults.js: savePeerReviewsFromCanvasToDatabase()", "No peer reviews assigned for this assignment on Canvas.")
                        break;
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

    setProgress(step) {
        progress = (step / progressNumSteps) * 100;
        progressBarMessage = [progress.toFixed(0) + "%"]
    }

    componentDidMount() {
        //Step 1
        this.setProgress(0)
    }

    render() {
        if (this.state.error) {
            return (
                <div>
                    {this.errorMessage}
                </div>
            )
        }

        if (this.pressed) {
            //Step 2
            localStorage.removeItem("analyzeDisplayTextNames_" + this.assignmentId)
            localStorage.removeItem("analyzeDisplayTextNumCompleted_" + this.assignmentId)
            localStorage.removeItem("analyzeDisplayTextNumAssigned_" + this.assignmentId)
            localStorage.removeItem("analyzeDisplayTextMessage_" + this.assignmentId)
            this.setProgress(1)
            return (
                <div>
                    {this.savePeerReviewsFromCanvasToDatabase()}
                </div>
            )
        }

        if (localStorage.getItem("analyzeDisplayTextNames_" + this.assignmentId)) {
            return (
                <div>
                <hr className="hr-4"></hr>
                  <div className="textmessage">
                    {localStorage.getItem("analyzeDisplayTextMessage_" + this.assignmentId)}
                  </div>
                    <br></br>
                    <br></br>
                    <Row>
                        <Well className="text">
                            <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.assignmentId)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.assignmentId)}
                        </Well>
                    <Popup className="pop-up" trigger={<button className="flagbutton"> View Flagged Grades ({JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignmentId)).length})</button>} modal closeOnDocumentClick >
                        <span><h5>Flagged Grades</h5></span>
                        <hr />
                        <span className="studentlist">
                            {JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignmentId))}
                        </span>
                    </Popup>
                  </Row>
                </div>
            )
        }

        return (
            <Progress value={progress}> {progressBarMessage} </Progress>
        )
    }
}

export default AnalyzeResults;

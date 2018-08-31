import { Boxplot } from 'react-boxplot';
import history from '../../history';
import Popup from 'reactjs-popup';
import { Progress, Tooltip } from 'reactstrap';
import React, { Component } from 'react';
import { Row } from 'react-bootstrap';

import PieCharts from '../PieCharts/PieCharts';

import 'bootstrap/dist/css/bootstrap.css';
import '../Assignments/Assignments.css'

//progress bar
var progress = 0;
var progressNumSteps = 15;
var progressBarMessage = "";

var message = "";

// Steps When Finalize Is Clicked Assuming Everything Works Correctly:
// 1 - progress bar reset (from componentDidMount)
// 2 - call to back-end to fetch peer reviews from canvas and save to SQL tables (from savePeerReviewsFromCanvasToDatabase)
// 3 - call to back-end to fetch rubric assessments from canvas and save the scores to SQL tables (from saveRubricScoresFromCanvasToDatabase)
// 4 - call to back-end to save the number of reviews originally assigned/completed into SQL tables (from saveOriginallyAssignedNumbersToDatabase)
// 5 - call to back-end to run the grading algorithm and save results to SQL tables (from finalizePeerReviewGrades)
// 6 - local storage is used to save completion stats (from finalizePeerReviewGrades)
// 7 - call to back-end to post calculated grades to canvas gradebook (from sendGradesToCanvas)
// 8 - call to back-end to sync up students' names with their entries in the SQL tables (from attachNamesToDatabase)
// 9 - call to back-end to count the number of students in each bucket (from countStudentsInEachBucket)
// 10 - local storage is used to save each count (from countStudentsInEachBucket)
// 11 - call to back-end to determine names of all students whose grades may be inaccurrate (from findFlaggedGrades)
// 12 - local storage is used to save array of students and their received grades (from findFlaggedGrades)
// 13 - call to back-end to fetch boxplot of grade breakdown from canvas (from pullBoxPlotFromCanvas)
// 14 - local storage is used to save five data points (from pullBoxPlotFromCanvas)
// 15 - call to back-end to count the number of students in each completion category (from findCompletedAllReviews)
// 16 - local storage is used to save each count (from findCompletedAllReviews)

class FinalizeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            benchmarks: this.props.benchmarks,
            finalizeDisplayText: false,
            penalizingForOriginalIncompletes: false,
            penalizingForReassignedIncompletes: false,
            tooltipOpen: false,
        };

        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this); //Step 8
        this.countStudentsInEachBucket = this.countStudentsInEachBucket.bind(this); //Steps 9 & 10
        this.finalizePeerReviewGrades = this.finalizePeerReviewGrades.bind(this); //Steps 5 & 6
        this.findCompletedAllReviews = this.findCompletedAllReviews.bind(this); //Steps 15 & 16
        this.findFlaggedGrades = this.findFlaggedGrades.bind(this); //Steps 11 & 12
        this.pullBoxPlotFromCanvas = this.pullBoxPlotFromCanvas.bind(this); //Steps 13 & 14
        this.saveOriginallyAssignedNumbersToDatabase = this.saveOriginallyAssignedNumbersToDatabase.bind(this); //Step 4
        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this); //Step 2
        this.saveRubricScoresFromCanvasToDatabase = this.saveRubricScoresFromCanvasToDatabase.bind(this); //Step 3
        this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this); //Step 7
        this.send400Error = this.send400Error.bind(this);
        this.send401Error = this.send401Error.bind(this);
        this.send404Error = this.send404Error.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.toggle = this.toggle.bind(this);

        this.assignmentId = this.props.assignmentId
        this.assignmentInfo = this.props.assignmentInfo
        this.courseId = this.props.courseId
    }

    attachNamesToDatabase() {
        let data = {
            courseId: this.courseId,
        }

        //Step 8
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
                        this.setProgress(7)
                        this.countStudentsInEachBucket()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 8 of the grading process. This function syncs syncs each student's actual name with all of their entries in the SQL tables", res.error, "FinalizeResults.js: attachNamesToDatabase()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Step 8 of the grading process. This function syncs syncs each student's actual name with all of their entries in the SQL tables", "FinalizeResults.js: attachNamesToDatabase()", "No students enrolled in this course on Canvas.")
                        break;
                    default:
                }
            })
    }

    countStudentsInEachBucket() {
        //Step 9
        fetch('/api/countStudentsInEachBucket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(8)
                        //Step 10
                        res.json().then(res => {
                            localStorage.setItem("spazzy_" + this.assignmentId, JSON.stringify(res.spazzy))
                            localStorage.setItem("definitelyHarsh_" + this.assignmentId, JSON.stringify(res.definitelyHarsh))
                            localStorage.setItem("couldBeHarsh_" + this.assignmentId, JSON.stringify(res.couldBeHarsh))
                            localStorage.setItem("couldBeLenient_" + this.assignmentId, JSON.stringify(res.couldBeLenient))
                            localStorage.setItem("definitelyLenient_" + this.assignmentId, JSON.stringify(res.definitelyLenient))
                            localStorage.setItem("couldBeFair_" + this.assignmentId, JSON.stringify(res.couldBeFair))
                            localStorage.setItem("definitelyFair_" + this.assignmentId, JSON.stringify(res.definitelyFair))
                            this.setProgress(9)
                        })
                            .then(() => this.findFlaggedGrades())
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Steps 9 & 10 of the grading process. This function counts the number of students that fell into each of the buckets.", res.error, "FinalizeResults.js: countStudentsInEachBucket()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    finalizePeerReviewGrades() {
        let data = {
            assignmentId: this.assignmentId,
            pointsPossible: this.assignmentInfo.points_possible,
            benchmarks: this.state.benchmarks,
            penalizingForOriginalIncompletes: this.props.penalizingForOriginalIncompletes,
            penalizingForReassignedIncompletes: this.props.penalizingForReassignedIncompletes,
        }

        //Step 5
        fetch('/api/peerReviewsFinalizing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(4)
                        res.json().then(res => message = res)
                            //Step 6
                            .then(() => {
                                localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.assignmentId, message.numCompleted);
                                localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.assignmentId, message.numAssigned);
                                localStorage.setItem("finalizeDisplayTextAverage_" + this.assignmentId, message.average);
                                localStorage.setItem("finalizeDisplayTextOutOf_" + this.assignmentId, message.outOf);
                            })
                            .then(() => this.setProgress(5))
                            .then(() => this.sendGradesToCanvas())
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Steps 5 and 6 of the grading process. This function runs the grading algorithm and returns statistics about the assignment.", res.error, "FinalizeResults.js: finalizePeerReviewGrades()", res.message)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Steps 5 and 6 of the grading process. This function runs the grading algorithm and returns statistics about the assignment.", "FinalizeResults.js: finalizePeerReviewGrades()", "No peer reviews have been assigned in this course on Canvas.")
                        break;
                    default:
                }
            })
    }

    findCompletedAllReviews() {
        let data = {
            assignmentId: this.assignmentId,
        }

        //Step 15
        fetch('/api/findCompletedAllReviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(14)
                        //Step 16
                        res.json().then(res => {
                            localStorage.setItem("completedAllReviews_" + this.assignmentId, res.completedAll)
                            localStorage.setItem("completedSomeReviews_" + this.assignmentId, res.completedSome)
                            localStorage.setItem("completedNoReviews_" + this.assignmentId, res.completedNone)
                            this.setProgress(15)
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Steps 15 & 16 of the grading process. This function counts how many students completed all/some/none of their peer reviews.", res.error, "FinalizeResults.js: findCompletedAllReviews()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    findFlaggedGrades() {
        let data = {
            assignmentId: this.assignmentId,
        }

        //Step 11
        fetch('/api/findFlaggedGrades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(10)
                        //Step 12
                        res.json().then(res => {
                            localStorage.setItem("flaggedStudents_" + this.assignmentId, JSON.stringify(res))
                            this.setProgress(11)
                        })
                            .then(() => this.pullBoxPlotFromCanvas())
                        break;
                    case 204:
                        //no flagged grades
                        this.setProgress(10)
                        //Step 12
                        localStorage.setItem("flaggedStudents_" + this.assignmentId, JSON.stringify([]))
                        this.setProgress(11)
                        this.pullBoxPlotFromCanvas()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Steps 11 & 12 of the grading process. This function gathers the names of every student who did not have enough data to accurrately calculate their grade.", res.error, "FinalizeResults.js: findFlaggedGrades()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    pullBoxPlotFromCanvas() {
        let data = {
            courseId: this.courseId,
            assignmentId: this.assignmentId
        }

        //Step 13
        fetch('/api/pullBoxPlotFromCanvas', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(12)
                        //Step 14
                        res.json().then(data => {
                            localStorage.setItem("min_" + this.assignmentId, data.min);
                            localStorage.setItem("q1_" + this.assignmentId, data.q1);
                            localStorage.setItem("median_" + this.assignmentId, data.median);
                            localStorage.setItem("q3_" + this.assignmentId, data.q3);
                            localStorage.setItem("max_" + this.assignmentId, data.max);
                            this.setProgress(13)
                        })
                            .then(() => this.findCompletedAllReviews())
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Steps 13 & 14 on the grading process. This function fetches the five-number summary of grades from Canvas.", res.error, "FinalizeResults.js: pullBoxPlotFromCanvas()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Steps 13 & 14 on the grading process. This function fetches the five-number summary of grades from Canvas.", "inalizeResults.js: pullBoxPlotFromCanvas()", "No assignments created in this course on Canvas.")
                        break;
                    default:
                }
            })
    }

    saveOriginallyAssignedNumbersToDatabase() {
        let data = {
            assignmentId: this.assignmentId,
        }

        //Step 4
        fetch('/api/savePeerReviewNumbers', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(3)
                        this.finalizePeerReviewGrades();
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 4 of the grading process. This function records the number of peer reviews assigned and completed by Due Date 2. This information is used to then track stats about any reassigned peer reviews.", res.error, "FinalizeResults.js: saveOriginallyAssignedNumbersToDabase()", res.message)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Step 4 of the grading process. This function records the number of peer reviews assigned and completed by Due Date 2. This information is used to then track stats about any reassigned peer reviews.", "FinalizeResults.js: saveOriginallyAssignedNumbersToDabase()", "No peer reviews have been assigned in this course on Canvas.")
                        break;
                    default:
                }
            })
    }

    savePeerReviewsFromCanvasToDatabase() {
        let data = {
            courseId: this.courseId,
            assignmentId: this.assignmentId,
            pointsPossible: this.assignmentInfo.points_possible,
        }

        //Step 2
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
                        this.setProgress(1)
                        this.saveRubricScoresFromCanvasToDatabase()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 2 of the grading process. This function fetches all peer review objects from Canvas and saves them to the SQL database.", res.error, "FinalizeResults.js: savePeerReviewsFromCanvasToDatabase()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Step 2 of the grading process. This function fetches all peer review objects from Canvas and saves them to the SQL database", "FinalizeResults.js: savePeerReviewsFromCanvasToDatabase()", "No peer reviews assigned for this assignment on Canvas.")
                        break;
                    default:
                }
            })
    }

    saveRubricScoresFromCanvasToDatabase() {
        let data = {
            courseId: this.courseId,
            assignmentId: this.assignmentId,
            rubricSettings: this.assignmentInfo.rubric_settings.id
        }

        //Step 3
        fetch('/api/saveAllRubrics', {
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
                        this.saveOriginallyAssignedNumbersToDatabase();
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 3 of the grading process. This function fetches all rubric assessments from Canvas and syncs the scores with the corresponding peer reviews in the SQL table.", res.error, "FinalizeResults.js: saveRubricScoresFromCanvasToDatabase()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            this.send401Error(res)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Step 3 of the grading process. This function fetches all rubric assessments from Canvas and syncs the scores with the corresponding peer reviews in the SQL table.", "FinalizeResults.js: saveRubricScoresFromCanvasToDatabase()", "No rubric assessments found for this assignment on Canvas.")
                        break;
                    default:
                }
            })
    }

    sendGradesToCanvas() {
        let data = {
            courseId: this.courseId,
            assignmentId: this.assignmentId,
        }

        //Step 7
        fetch('/api/sendGradesToCanvas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(6)
                        this.attachNamesToDatabase()
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 7 of the grading process. This function posts each calculated grade to the Canvas gradbeook.", res.error, "FinalizeResults.js: sendGradesToCanvas()", res.message)
                        })
                        break;
                    case 404:
                        this.send404Error("This function is called in Step 7 of the grading process. This function posts each calculated grade to the Canvas gradbeook.", "FinalizeResults.js: sendGradesToCanvas()", "No students found in gradebook SQL table.")
                        break;
                    default:
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

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        //Step 1
        this.setProgress(0)
    }

    render() {
        if (this.props.pressed) {
            this.savePeerReviewsFromCanvasToDatabase()
            return (
                <div></div>
            )
        }

        if (localStorage.getItem("completedAllReviews_" + this.assignmentId)) {
            return (
                <div>
                    //results and data after finalizing an assignment
                    <hr className="hr-6"></hr>
                    <h2 className="header-text">Score Details</h2>
                    <hr className="hr-2"></hr>
                    <p className="total-score"> -/{Number(localStorage.getItem("finalizeDisplayTextOutOf_" + this.assignmentId))}pts</p>
                    <Row className="score-dets">
                        <p className="stats"> Mean: {Number(localStorage.getItem("finalizeDisplayTextAverage_" + this.assignmentId)).toFixed(1)}</p>
                        <p className="stats"> High: {Number(localStorage.getItem("max_" + this.assignmentId)).toFixed(0)}</p>
                        <p className="stats"> Low: {Number(localStorage.getItem("min_" + this.assignmentId)).toFixed(0)}</p>
                        <span className="boxplot" id={"TooltipBoxplot"}>
                            <Boxplot
                                width={400} height={25} orientation="horizontal"
                                min={0} max={100}
                                stats={{
                                    whiskerLow: localStorage.getItem("min_" + this.assignmentId),
                                    quartile1: localStorage.getItem("q1_" + this.assignmentId),
                                    quartile2: localStorage.getItem("median_" + this.assignmentId),
                                    quartile3: localStorage.getItem("q3_" + this.assignmentId),
                                    whiskerHigh: localStorage.getItem("max_" + this.assignmentId),
                                    outliers: [],
                                }} />
                        </span>
                    </Row>
                    <hr className="hr-5"></hr>
                    <Row>
                        <p className="page-text">Completed Peer Reviews: {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.assignmentId)}</p>
                        <p className="date">Date Finalized: {localStorage.getItem("finalized_" + this.assignmentId)}</p>
                        //flagged grades button to modal
                        <Popup className="flagged-grades-modal"
                            trigger={<button className="flagged-button"> View Flagged Grades ({JSON.parse(localStorage.getItem("flaggedStudents_" + this.assignmentId)).length})</button>}
                            modal
                            closeOnDocumentClick
                        >
                            <span><h5 className="modal-text">Flagged Grades</h5></span>
                            <hr />
                            <span className="student-list">
                                {JSON.parse(localStorage.getItem("flaggedStudents_" + this.assignmentId))}
                            </span>
                        </Popup>
                    </Row>
                    <br />
                    <hr className="hr-5"></hr>
                    //boxplot from Canvas data
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
                        <strong>Min Score:</strong> {localStorage.getItem("min_" + this.assignmentId)}
                        <br />
                        <strong>First Quartile:</strong> {localStorage.getItem("q1_" + this.assignmentId)}
                        <br />
                        <strong>Median Score:</strong> {localStorage.getItem("median_" + this.assignmentId)}
                        <br />
                        <strong>Third Quartile:</strong> {localStorage.getItem("q3_" + this.assignmentId)}
                        <br />
                        <strong>Max Score:</strong> {localStorage.getItem("max_" + this.assignmentId)}
                    </Tooltip>
                    <br />
                    <br />
                    <PieCharts assignmentId={this.assignmentId} />
                </div>
            )
        }

        return (
            <Progress className="progress-bar" value={progress}> {progressBarMessage} </Progress>
        )
    }

}


export default FinalizeResults;

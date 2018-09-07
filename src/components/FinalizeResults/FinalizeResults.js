import { Boxplot } from 'react-boxplot';
import history from '../../history';
import Popup from 'reactjs-popup';
import { Progress, Tooltip } from 'reactstrap';
import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import moment from 'moment';

import PieCharts from '../PieCharts/PieCharts';

import 'bootstrap/dist/css/bootstrap.css';
import '../Assignments/Assignments.css'
import { masterSetLocalStorage } from '../../App';

//progress bar
var progress = 0;
var progressNumSteps = 15;
var progressBarMessage = "";

var message = "";

// Steps When Finalize Is Clicked Assuming Everything Works Correctly:
// 0 - progress bar reset (from componentDidMount)
// 1 - call to back-end to fetch peer reviews from canvas and save to SQL tables (from savePeerReviewsFromCanvasToDatabase)
// 2 - call to back-end to fetch rubric assessments from canvas and save the scores to SQL tables (from saveRubricScoresFromCanvasToDatabase)
// 3 - call to back-end to save the number of reviews originally assigned/completed into SQL tables (from saveOriginallyAssignedPeerReviewNumbers)
// 4 - call to back-end to run the grading algorithm and save results to SQL tables (from finalizePeerReviewGrades)
// 5 - local storage is used to save completion stats (from finalizePeerReviewGrades)
// 6 - call to back-end to post calculated grades to canvas gradebook (from sendGradesToCanvas)
// 7 - call to back-end to count the number of students in each bucket (from countStudentsInEachBucket)
// 8 - local storage is used to save each count (from countStudentsInEachBucket)
// 9 - call to back-end to determine names of all students whose grades may be inaccurrate (from findFlaggedGrades)
// 10 - local storage is used to save array of students and their received grades (from findFlaggedGrades)
// 11 - call to back-end to fetch boxplot of grade breakdown from canvas (from pullBoxPlotFromCanvas)
// 12 - local storage is used to save five data points (from pullBoxPlotFromCanvas)
// 13 - call to back-end to count the number of students in each completion category (from findCompletedAllReviews)
// 14 - local storage is used to save each count (from findCompletedAllReviews)
// 15 - call to back-end to save local storage data for this assignment (from saveAssignmentLocalStorageData)

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

        this.countStudentsInEachBucket = this.countStudentsInEachBucket.bind(this); //Steps 7 & 8
        this.finalizePeerReviewGrades = this.finalizePeerReviewGrades.bind(this); //Steps 4 & 5
        this.findCompletedAllReviews = this.findCompletedAllReviews.bind(this); //Steps 13 & 14
        this.findFlaggedGrades = this.findFlaggedGrades.bind(this); //Steps 9 & 10
        this.pullBoxPlotFromCanvas = this.pullBoxPlotFromCanvas.bind(this); //Steps 11 & 12
        this.saveAssignmentLocalStorageData = this.saveAssignmentLocalStorageData.bind(this); //Step 15
        this.saveOriginallyAssignedPeerReviewNumbers = this.saveOriginallyAssignedPeerReviewNumbers.bind(this); //Step 3
        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this); //Step 1
        this.saveRubricScoresFromCanvasToDatabase = this.saveRubricScoresFromCanvasToDatabase.bind(this); //Step 2
        this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this); //Step 6
        this.send400Error = this.send400Error.bind(this);
        this.send401Error = this.send401Error.bind(this);
        this.send404Error = this.send404Error.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.toggle = this.toggle.bind(this);

        this.assignmentId = this.props.assignmentId;
        this.assignmentInfo = this.props.assignmentInfo;
        this.canvasUserId = this.props.canvasUserId;
        this.courseId = this.props.courseId;
        this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
    }

    countStudentsInEachBucket() {
        let data = {
            courseId: this.courseId,
        }

        //Step 7
        fetch('/api/countStudentsInEachBucket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(7)
                        //Step 8
                        res.json().then(res => {
                            masterSetLocalStorage("spazzy" + this.localStorageExtension, JSON.stringify(res.spazzy))
                            masterSetLocalStorage("definitelyHarsh" + this.localStorageExtension, JSON.stringify(res.definitelyHarsh))
                            masterSetLocalStorage("couldBeHarsh" + this.localStorageExtension, JSON.stringify(res.couldBeHarsh))
                            masterSetLocalStorage("couldBeLenient" + this.localStorageExtension, JSON.stringify(res.couldBeLenient))
                            masterSetLocalStorage("definitelyLenient" + this.localStorageExtension, JSON.stringify(res.definitelyLenient))
                            masterSetLocalStorage("couldBeFair" + this.localStorageExtension, JSON.stringify(res.couldBeFair))
                            masterSetLocalStorage("definitelyFair" + this.localStorageExtension, JSON.stringify(res.definitelyFair))
                            this.setProgress(8)
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
            benchmarks: this.state.benchmarks,
            courseId: this.courseId,
            penalizingForOriginalIncompletes: this.props.penalizingForOriginalIncompletes,
            penalizingForReassignedIncompletes: this.props.penalizingForReassignedIncompletes,
            pointsPossible: this.assignmentInfo.points_possible,
        }

        //Step 4
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
                            //Step 5
                            .then(() => {
                                masterSetLocalStorage("finalizeDisplayTextNumCompleted" + this.localStorageExtension, message.numCompleted);
                                masterSetLocalStorage("finalizeDisplayTextNumAssigned" + this.localStorageExtension, message.numAssigned);
                                masterSetLocalStorage("finalizeDisplayTextAverage" + this.localStorageExtension, message.average);
                                masterSetLocalStorage("finalizeDisplayTextOutOf" + this.localStorageExtension, message.outOf);
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
            courseId: this.courseId,
        }

        //Step 13
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
                        this.setProgress(13)
                        //Step 14
                        res.json().then(res => {
                            masterSetLocalStorage("completedAllReviews" + this.localStorageExtension, res.completedAll)
                            masterSetLocalStorage("completedSomeReviews" + this.localStorageExtension, res.completedSome)
                            masterSetLocalStorage("completedNoReviews" + this.localStorageExtension, res.completedNone)
                            this.setProgress(14)
                            this.saveAssignmentLocalStorageData()
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
            courseId: this.courseId,
        }

        //Step 9
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
                        this.setProgress(9)
                        //Step 10
                        res.json().then(res => {
                            masterSetLocalStorage("flaggedStudents" + this.localStorageExtension, JSON.stringify(res))

                            this.setProgress(10)
                        })
                            .then(() => this.pullBoxPlotFromCanvas())
                        break;
                    case 204:
                        //no flagged grades
                        this.setProgress(9)
                        //Step 10
                        masterSetLocalStorage("flaggedStudents" + this.localStorageExtension, JSON.stringify([]))
                        this.setProgress(10)
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
            assignmentId: this.assignmentId,
            canvasUserId: this.canvasUserId,
            courseId: this.courseId,
        }

        //Step 11
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
                        this.setProgress(11)
                        //Step 12
                        res.json().then(data => {
                            masterSetLocalStorage("min" + this.localStorageExtension, data.min);
                            masterSetLocalStorage("q1" + this.localStorageExtension, data.q1);
                            masterSetLocalStorage("median" + this.localStorageExtension, data.median);
                            masterSetLocalStorage("q3" + this.localStorageExtension, data.q3);
                            masterSetLocalStorage("max" + this.localStorageExtension, data.max);
                            this.setProgress(12)
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

    saveAssignmentLocalStorageData() {
        console.log("saving local storage data")
        let data = {
            assignmentId: this.assignmentId,
            canvasUserId: this.canvasUserId,
            courseId: this.courseId,
            localStorage: {},
        };

        let finalizedRegex = /finalized_/
        let dueDateRegex = /dueDate/

        for (var i = 0; i < localStorage.length; i++) {
            let field = localStorage.key(i)
            let value = localStorage.getItem(field);

            if (field.match(finalizedRegex) || (field.match(dueDateRegex) && value !== "N/A")) {
                let newDate = new Date(value)
                value = moment(newDate).format('YYYY[-]MM[-]DD HH:mm:ss');
            }
            data.localStorage[field] = value
        }

        delete data.localStorage["pageSaved?"]

        //Step 15
        fetch('/api/saveAssignmentLocalStorageData', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(15)
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called in Step 15 of the grading process. This function saves all of the data for the assignment just finalized to the SQL database", res.error, "FinalizeResults.js: saveAssignmentLocalStorageData()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    saveOriginallyAssignedPeerReviewNumbers() {
        let data = {
            assignmentId: this.assignmentId,
            courseId: this.courseId,
        }

        //Step 3
        fetch('/api/saveOriginallyAssignedPeerReviewNumbers', {
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
            assignmentId: this.assignmentId,
            canvasUserId: this.canvasUserId,
            courseId: this.courseId,
            pointsPossible: this.assignmentInfo.points_possible,
        }

        //Step 1
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
            assignmentId: this.assignmentId,
            canvasUserId: this.canvasUserId,
            courseId: this.courseId,
            rubricSettings: this.assignmentInfo.rubric_settings.id
        }

        //Step 2
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
                        this.saveOriginallyAssignedPeerReviewNumbers();
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
            assignmentId: this.assignmentId,
            canvasUserId: this.canvasUserId,
            courseId: this.courseId,
        }

        //Step 6
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
                        this.countStudentsInEachBucket()
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

        if (localStorage.getItem("completedAllReviews" + this.localStorageExtension)) {
            return (
                <div className="finalized-results-case">
                    {/* results and data after finalizing an assignment */}
                    <h2 className="header-text">Score Details</h2>
                    <hr className="hr-2"></hr>
                    <p className="total-score"> -/{Number(localStorage.getItem("finalizeDisplayTextOutOf" + this.localStorageExtension))}pts</p>
                    <Row className="score-dets">
                        <p className="stats"> Mean: {Number(localStorage.getItem("finalizeDisplayTextAverage" + this.localStorageExtension)).toFixed(1)}</p>
                        <p className="stats"> High: {Number(localStorage.getItem("max" + this.localStorageExtension)).toFixed(0)}</p>
                        <p className="stats"> Low: {Number(localStorage.getItem("min" + this.localStorageExtension)).toFixed(0)}</p>
                        <span className="boxplot" id={"TooltipBoxplot"}>
                            <Boxplot
                                width={400} height={25} orientation="horizontal"
                                min={0} max={100}
                                stats={{
                                    whiskerLow: localStorage.getItem("min" + this.localStorageExtension),
                                    quartile1: localStorage.getItem("q1" + this.localStorageExtension),
                                    quartile2: localStorage.getItem("median" + this.localStorageExtension),
                                    quartile3: localStorage.getItem("q3" + this.localStorageExtension),
                                    whiskerHigh: localStorage.getItem("max" + this.localStorageExtension),
                                    outliers: [],
                                }} />
                        </span>
                    </Row>
                    <hr className="hr-5"></hr>
                    <Row>
                        <p className="page-text">Completed Peer Reviews: {localStorage.getItem("finalizeDisplayTextNumCompleted" + this.localStorageExtension)} / {localStorage.getItem("finalizeDisplayTextNumAssigned" + this.localStorageExtension)}</p>
                        <p className="date">Date Finalized: {localStorage.getItem("finalized" + this.localStorageExtension)}</p>
                        {/* flagged grades button to modal */}
                        <Popup className="flagged-grades-modal"
                            trigger={<button className="flagged-button"> View Flagged Grades ({JSON.parse(localStorage.getItem("flaggedStudents" + this.localStorageExtension)).length})</button>}
                            modal
                            closeOnDocumentClick
                        >
                            <h5 className="modal-text">Flagged Grades</h5>
                            <hr />
                            <span className="student-list">
                                {JSON.parse(localStorage.getItem("flaggedStudents" + this.localStorageExtension)).length == 0 ? "No flagged grades" : (JSON.parse(localStorage.getItem("flaggedStudents" + this.localStorageExtension))).join(", ")}
                            </span>
                        </Popup>
                    </Row>
                    <br />
                    <hr className="hr-5"></hr>
                    {/* boxplot from Canvas data */}
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
                        <strong>Min Score:</strong> {localStorage.getItem("min" + this.localStorageExtension)}
                        <br />
                        <strong>First Quartile:</strong> {localStorage.getItem("q1" + this.localStorageExtension)}
                        <br />
                        <strong>Median Score:</strong> {localStorage.getItem("median" + this.localStorageExtension)}
                        <br />
                        <strong>Third Quartile:</strong> {localStorage.getItem("q3" + this.localStorageExtension)}
                        <br />
                        <strong>Max Score:</strong> {localStorage.getItem("max" + this.localStorageExtension)}
                    </Tooltip>
                    <br />
                    <br />
                    <PieCharts assignmentId={this.assignmentId} courseId={this.courseId} />
                </div>
            )
        }

        if (localStorage.getItem("finalized" + this.localStorageExtension)) {
            return (
                <div className="progress-bar">
                    <Progress value={progress}> {progressBarMessage} </Progress>
                </div>
            )
        }

        return (
            <div>
                It looks like you need to refresh your data. Please click the button on the sidebar.
            </div>
        )
    }

}

export default FinalizeResults;
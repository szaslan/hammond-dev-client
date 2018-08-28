import React, { Component } from 'react';
import { Boxplot } from 'react-boxplot';
import { Ellipse } from 'react-shapes';
import { Progress, Tooltip } from 'reactstrap';
import { Well, Row, Col } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import history from '../../history';
import Popup from 'reactjs-popup';
import ReactSvgPieChart from "react-svg-piechart";
import SideNav from 'react-simple-sidenav';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

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
            hoveringOverPieChart1: false,
            hoveringOverPieChart2: false,
            sectorTitle1: '',
            sectorValue1: '',
            sectorTitle2: '',
            sectorValue2: '',
            penalizingForIncompletes: false,
            penalizingForReassigned: false,
            tooltipOpen: false,
        };

        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this); //Step 8
        this.clearPieChart1 = this.clearPieChart1.bind(this);
        this.clearPieChart2 = this.clearPieChart2.bind(this);
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
        this.countStudentsInEachBucket = this.countStudentsInEachBucket.bind(this); //Steps 9 & 10
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
                }
            })
    }

    clearPieChart1() {
        this.setState({
            hoveringOverPieChart1: false,
            sectorTitle1: '',
            sectorValue1: '',
        })
    }

    clearPieChart2() {
        this.setState({
            hoveringOverPieChart2: false,
            sectorTitle2: '',
            sectorValue2: '',
        })
    }

    finalizePeerReviewGrades() {
        let data = {
            assignmentId: this.assignmentId,
            pointsPossible: this.assignmentInfo.points_possible,
            benchmarks: this.state.benchmarks,
            penalizingForIncompletes: this.props.penalizingForIncompletes,
            penalizingForReassigned: this.props.penalizingForReassigned,
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
                }
            })
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
        /*else {
            if (this.state.error) {
                return (
                    <div>
                        {this.error_message}
                    </div>
                )
            }
            else {
                return (
                    <div>
                        {
                            localStorage.getItem("completed_all_reviews_" + this.props.assignmentId) ?
                                // localStorage.getItem("harsh_students_" + this.props.assignmentId) && localStorage.getItem("max_" + this.props.assignmentId) ?
                                <div>
                                    {<SideNav
                                        title="Simple Sidenav"
                                        items={['Item 1', 'Item 2']}
                                        showNav={this.state.showNav}
                                    />}*/
        //                                     <hr className="hr-6"></hr>
        //                                           <h2 className="headertext">Score Details
        //                                           {/*<button className="clear-local-button" onClick={this.clearLocalStorage}> Clear Local Storage</button>*/}
        //                                           </h2>
        //                                           <hr className="hr-2"></hr>
        //                                             {/*<p><strong>Title: </strong>{this.state.assignment.name}</p>*/}
        //                                             <br></br>
        //                                     <p className="totalscore"> -/{localStorage.getItem("finalizeDisplayTextOutOf_" + this.props.assignmentId)}pts</p>
        //                                     <Row className="scoredets">
        //                                       <p className="stats"> Mean: {localStorage.getItem("finalizeDisplayTextAverage_" + this.props.assignmentId)}</p>
        //                                       <p className="stats"> High: {localStorage.getItem("max_" + this.props.assignmentId)}</p>
        //                                       <p className="stats"> Low: {localStorage.getItem("min_" + this.props.assignmentId)}</p>
        //                                       <span className="boxplot" id={"TooltipBoxplot"}>
        //                                         <Boxplot
        //                                             width={350} height={25} orientation="horizontal"
        //                                             min={0} max={100}
        //                                             stats={{
        //                                                 whiskerLow: localStorage.getItem("min_" + this.props.assignmentId),
        //                                                 quartile1: localStorage.getItem("q1_" + this.props.assignmentId),
        //                                                 quartile2: localStorage.getItem("median_" + this.props.assignmentId),
        //                                                 quartile3: localStorage.getItem("q3_" + this.props.assignmentId),
        //                                                 whiskerHigh: localStorage.getItem("max_" + this.props.assignmentId),
        //                                                 outliers: [],
        //                                             }} />
        //                                       </span>
        //                                     </Row>
        //                                     <br></br>
        //                                     <br></br>
        //                                     <hr className="hr-5"></hr>
        //                                     <Row>
        //                                       <p className="pagetext">Completed Peer Reviews: {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId)}</p>
        //                                       <p className="date">Date Finalized: {localStorage.getItem("finalized_" + this.props.assignmentId)}</p>
        //                                       <Popup className="pop-up"
        //                                           trigger={<button className="flaggedbutton"> View Flagged Grades </button>}
        //                                           modal
        //                                           closeOnDocumentClick
        //                                       >
        //                                           <span><h5 className="modaltext">Flagged Grades</h5></span>
        //                                           <hr />
        //                                           <span className="studentlist">
        //                                             {JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId)).join(", ")}
        //                                           </span>
        //                                       </Popup>
        //                                     </Row>
        //                                     <br></br>
        //                                     <hr className="hr-5"></hr>
        //                                     {/* <strong>Completed All Reviews: </strong>{localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)} / {Number(localStorage.getItem("completed_all_reviews_out_of_" + this.props.assignmentId)) + Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId))} */}
        //                                     <Tooltip placement="right" delay={{ show: "300" }} isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
        //                                         <strong>Min Score:</strong> {localStorage.getItem("min_" + this.props.assignmentId)}
        //                                         <br></br>
        //                                         <strong>First Quartile:</strong> {localStorage.getItem("q1_" + this.props.assignmentId)}
        //                                         <br></br>
        //                                         <strong>Median Score:</strong> {localStorage.getItem("median_" + this.props.assignmentId)}
        //                                         <br></br>
        //                                         <strong>Third Quartile:</strong> {localStorage.getItem("q3_" + this.props.assignmentId)}
        //                                         <br></br>
        //                                         <strong>Max Score:</strong> {localStorage.getItem("max_" + this.props.assignmentId)}
        //                                     </Tooltip>

        //                                     <br></br>
        //                                     <br></br>

        //                                     <Row>
        //                                         <Well className="well2">
        //                                             <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
        //                                                 {/* <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignmentId))} /> */}
        //                                                 {/* <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignmentId))} /> */}
        //                                                 {/* <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignmentId))} /> */}
        //                                                 {/* <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignmentId))} /> */}
        //                                                 {/*<Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId))} /> */}
        //                                             </Flexbox>
        //                                         </Well>
        //                                     </Row>
        //                                     <br></br>
        //                                     <Row>
        //                                       <Col className="graph1">
        //                                             <h5 className="graphTitle">Completion</h5>
        //                                             <p className="graphsub">Total: {Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)) + Number(localStorage.getItem("completed_some_reviews_" + this.props.assignmentId)) + Number(localStorage.getItem("completed_no_reviews_" + this.props.assignmentId))}</p>
        //                                             <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
        //                                             <ReactSvgPieChart className="piechart"
        //                                                 expandSize={3}
        //                                                 expandOnHover="false"
        //                                                 data={[
        //                                                     {title: "Completed all reviews", value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)), color: '#E38627' },
        //                                                     {title: "Completed some reviews", value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignmentId)), color: '#C13C37' },
        //                                                     {title: "Completed no reviews", value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignmentId)), color: '#6A2135' },
        //                                                 ]}
        //                                                 onSectorHover={(d) => {
        //                                                     if (d) {
        //                                                         // console.log("value: ", d.value);
        //                                                         this.state.sectorValue1 = d.value;
        //                                                         this.state.sectorTitle1 = d.title;
        //                                                         this.state.check = true;
        //                                                     }
        //                                                 }
        //                                                 }
        //                                             />

        //                                         </Flexbox>
        //                                             <Well className="pieinfo">
        //                                                 {this.state.check ?
        //                                                     this.state.sectorTitle1 + ": " + this.state.sectorValue1 + " student(s)"
        //                                                 :
        //                                                 "Hover over a sector to display completion data. There may be a slight delay."}
        //                                                 </Well>
        //                                             <br />

        //                                         <div className="legend">
        //                                             <Row>
        //                                                 <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#E38627' }} strokeWidth={5} />
        //                                                 <p className="compkey">Completed all reviews</p>
        //                                             </Row>
        //                                             <Row>
        //                                                 <Ellipse rx={7} ry={4} fill={{ color: '#C13C37' }} strokeWidth={5} />
        //                                                 <p className="compkey">Completed some reviews</p>
        //                                             </Row>
        //                                             <Row>
        //                                                 <Ellipse rx={7} ry={4} fill={{ color: '#6A2135' }} strokeWidth={5} />
        //                                                 <p className="compkey">Completed no reviews</p>
        //                                             </Row>
        //                                             </div>
        //                                           </Col>
        //                                           <Col className="graph2">
        //                                             <h5 className="graphTitle">Grading Classification</h5>
        //                                             <p className="graphsub">Total: {Number(localStorage.getItem("definitely_harsh_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("could_be_harsh_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("definitely_lenient_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("could_be_lenient_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("definitely_fair_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("could_be_fair_" + this.props.assignmentId)) +
        //                                             Number(localStorage.getItem("spazzy_" + this.props.assignmentId))}</p>
        //                                             <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
        //                                             <ReactSvgPieChart className="piechart"
        //                                                 expandSize={3}
        //                                                 expandOnHover="false"
        //                                                 data={[
        //                                                     {title: "Definitely harsh", value: Number(localStorage.getItem("definitely_harsh_" + this.props.assignmentId)), color: '#ad1f1f' },
        //                                                     {title: "Could be harsh", value: Number(localStorage.getItem("could_be_harsh_" + this.props.assignmentId)), color: '#d6a0a0' },
        //                                                     {title: "Definitely lenient", value: Number(localStorage.getItem("definitely_lenient_" + this.props.assignmentId)), color: '#001887' },
        //                                                     {title: "Could be lenient", value: Number(localStorage.getItem("could_be_lenient_" + this.props.assignmentId)), color: '#b3bbdd' },
        //                                                     {title: "Definitely fair", value: Number(localStorage.getItem("definitely_fair_" + this.props.assignmentId)), color: '#063d11' },
        //                                                     {title: "Could be fair", value: Number(localStorage.getItem("could_be_fair_" + this.props.assignmentId)), color: '#94b29a' },
        //                                                     {title:"Spazzy", value: Number(localStorage.getItem("spazzy_" + this.props.assignmentId)), color: '#c68100' }
        //                                                 ]}
        //                                                 onSectorHover={(d) => {
        //                                                     if (d) {
        //                                                         // console.log("value: ", d.value);
        //                                                         this.state.sectorValue2 = d.value;
        //                                                         this.state.sectorTitle2 = d.title;
        //                                                         this.state.check2 = true;
        //                                                     }
        //                                                 }
        //                                                 }
        //                                             />

        //                                           </Flexbox>
        //                                             <Well className="pieinfo">
        //                                             {this.state.check2 ?
        //                                                 this.state.sectorTitle2 + ": " + this.state.sectorValue2 + " student(s)"
        //                                             :
        //                                             "Hover over a sector to display grading classification data. There may be a slight delay."}
        //                                             </Well>
        //                                                 <br />
        //                                             <div className="legend">
        //                                             <Row>
        //                                               <Col>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#ad1f1f' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Definitely Harsh</p>
        //                                                 </Row>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#d6a0a0' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Could be Harsh</p>
        //                                                 </Row>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#001887' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Definitely Lenient</p>
        //                                                 </Row>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#b3bbdd' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Could be Lenient</p>
        //                                                 </Row>
        //                                               </Col>
        //                                               <Col>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#063d11' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Definitely Fair</p>
        //                                                 </Row>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#94b29a' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Could be Fair</p>
        //                                                 </Row>
        //                                                 <Row>
        //                                                   <Ellipse rx={7} ry={4} fill={{ color: '#c68100' }} strokeWidth={5} />
        //                                                   <p className="graphKey">Spazzy</p>
        //                                                 </Row>
        //                                               </Col>
        //                                             </Row>
        //                                           </div>
        //                                         </Col>
        //                                     </Row>

        //                                 </div>
        //                                 :
        //                                 <Progress className="progressbar" value={progress}> {progress_bar_message} </Progress>
        //                         }
        //                     </div>
        //                 )
        //             }

        if (this.props.pressed) {
            this.savePeerReviewsFromCanvasToDatabase()
            return (
                <div></div>
            )
        }
        else if (localStorage.getItem("completedAllReviews_" + this.assignmentId)) {
            return (
                <div>
                    {/* <SideNav
                        title="Simple Sidenav"
                        items={['Item 1', 'Item 2']}
                        showNav={this.state.showNav}
                    /> */}
                    <p className="totalscore"> -/{localStorage.getItem("finalizeDisplayTextOutOf_" + this.assignmentId)}pts</p>
                    <Row className="scoredets">
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
                    <br></br>
                    <br></br>
                    <hr className="hr-4"></hr>
                    <Row>
                        <p className="pagetext">Completed Peer Reviews: {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.assignmentId)}</p>
                        <p className="date">Date Finalized: {localStorage.getItem("finalized_" + this.assignmentId)}</p>
                    </Row>
                    <br></br>
                    <hr className="hr-4"></hr>
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
                        <strong>Min Score:</strong> {localStorage.getItem("min_" + this.assignmentId)}
                        <br></br>
                        <strong>First Quartile:</strong> {localStorage.getItem("q1_" + this.assignmentId)}
                        <br></br>
                        <strong>Median Score:</strong> {localStorage.getItem("median_" + this.assignmentId)}
                        <br></br>
                        <strong>Third Quartile:</strong> {localStorage.getItem("q3_" + this.assignmentId)}
                        <br></br>
                        <strong>Max Score:</strong> {localStorage.getItem("max_" + this.assignmentId)}
                    </Tooltip>

                    <br></br>
                    <br></br>
                    <Row>
                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                            <h5 className="graphTitle">Completion</h5>
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Completed all reviews", value: Number(localStorage.getItem("completedAllReviews_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Completed some reviews", value: Number(localStorage.getItem("completedSomeReviews_" + this.assignmentId)), color: '#C68100' },
                                    { title: "Completed no reviews", value: Number(localStorage.getItem("completedNoReviews_" + this.assignmentId)), color: '#AD1F1F' },
                                ]}
                                onSectorHover={(d) => {
                                    if (d) {
                                        this.setState({
                                            sectorValue1: d.value,
                                            sectorTitle1: d.title,
                                            hoveringOverPieChart1: true,
                                        })
                                    }
                                    else {
                                        this.clearPieChart1()
                                    }
                                }}
                            />
                            <Well className="pieinfo">
                                {this.state.hoveringOverPieChart1 ?
                                    this.state.sectorTitle1 + ": " + this.state.sectorValue1 + " student" + (this.state.sectorValue1 != 1 ? "s" : "")
                                    :
                                    "Hover over a sector to display completion data. There may be a slight delay."}
                            </Well>
                            <br />
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 == "Completed all reviews" ? { fontWeight: 'bold' } : null}>Completed all reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 == "Completed some reviews" ? { fontWeight: 'bold' } : null}>Completed some reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 == "Completed no reviews" ? { fontWeight: 'bold' } : null}>Completed no reviews</p>
                            </Row>
                        </Flexbox>
                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                            <h5 className="graphTitle">Grading Classification</h5>
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Definitely Harsh", value: Number(localStorage.getItem("definitelyHarsh_" + this.assignmentId)), color: '#AD1F1F' },
                                    { title: "Could be Harsh", value: Number(localStorage.getItem("couldBeHarsh_" + this.assignmentId)), color: '#D6A0A0' },
                                    { title: "Definitely Lenient", value: Number(localStorage.getItem("definitelyLenient_" + this.assignmentId)), color: '#001887' },
                                    { title: "Could be Lenient", value: Number(localStorage.getItem("couldBeLenient_" + this.assignmentId)), color: '#B3BBDD' },
                                    { title: "Definitely Fair", value: Number(localStorage.getItem("definitelyFair_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Could be Fair", value: Number(localStorage.getItem("couldBeFair_" + this.assignmentId)), color: '#94B29A' },
                                    { title: "Spazzy", value: Number(localStorage.getItem("spazzy_" + this.assignmentId)), color: '#C68100' }
                                ]}
                                onSectorHover={(d) => {
                                    if (d) {
                                        this.setState({
                                            sectorValue2: d.value,
                                            sectorTitle2: d.title,
                                            hoveringOverPieChart2: true,
                                        })
                                    }
                                    else {
                                        this.clearPieChart2()
                                    }
                                }
                                }
                            />
                            <Well className="pieinfo">
                                {this.state.hoveringOverPieChart2 ?
                                    this.state.sectorTitle2 + ": " + this.state.sectorValue2 + " student" + (this.state.sectorValue2 != 1 ? "s" : "")
                                    :
                                    "Hover over a sector to display grading classification data. There may be a slight delay."}
                            </Well>
                            <br />
                            <div className="legend">
                                <Row>
                                    <Col>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Spazzy" ? { fontWeight: 'bold' } : null}>Spazzy</p>
                                        </Row>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Definitely Harsh" ? { fontWeight: 'bold' } : null}>Definitely Harsh</p>
                                        </Row>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#D6A0A0' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Could be Harsh" ? { fontWeight: 'bold' } : null}>Could be Harsh</p>
                                        </Row>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#B3BBDD' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Could be Lenient" ? { fontWeight: 'bold' } : null}>Could be Lenient</p>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#001887' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Definitely Lenient" ? { fontWeight: 'bold' } : null}>Definitely Lenient</p>
                                        </Row>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#94B29A' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Could be Fair" ? { fontWeight: 'bold' } : null}>Could be Fair</p>
                                        </Row>
                                        <Row>
                                            <Ellipse rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                            <p className="graphKey" style={this.state.sectorTitle2 == "Definitely Fair" ? { fontWeight: 'bold' } : null}>Definitely Fair</p>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </Flexbox>
                    </Row>
                    <hr className="hr-4"></hr>
                    <Popup className="pop-up"
                        trigger={<button className="flaggedbutton"> View Flagged Grades ({JSON.parse(localStorage.getItem("flaggedStudents_" + this.assignmentId)).length})</button>}
                        modal
                        closeOnDocumentClick
                    >
                        <span><h5 className="modaltext">Flagged Grades</h5></span>
                        <hr />
                        <span className="studentlist">
                            {JSON.parse(localStorage.getItem("flaggedStudents_" + this.assignmentId))}
                        </span>
                    </Popup>
                </div>
            )
        }

       else {
           return (
            <Progress value={progress}> {progressBarMessage} </Progress>
        )
    }

}
}

export default FinalizeResults;
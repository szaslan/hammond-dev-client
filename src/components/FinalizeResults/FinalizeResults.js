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
            error: false,
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
        this.setProgress = this.setProgress.bind(this);
        this.countStudentsInEachBucket = this.countStudentsInEachBucket.bind(this); //Steps 9 & 10
        this.toggle = this.toggle.bind(this);

        this.assignmentId = this.props.assignmentId
        this.assignmentInfo = this.props.assignmentInfo
        this.courseId = this.props.courseId
        this.errorMessage = "An error has occurred. Please consult the console to see what has gone wrong"
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: attachNamesToDatabase() (error came from Canvas)",
                                message: res.message,
                            }
                        })
                    })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("there are no students enrolled in this course")
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: finalizePeerReviewGrades()",
                            }
                        })
                    })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no peer reviews have been completed for this assignment")
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: findCompletedAllReviews()",
                            }
                        })
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: findFlaggedGrades()",
                            }
                        })
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                location: "FinalizeResults.js: pullBoxPlotFromCanvas() (error came from Canvas)",
                                message: res.message,
                            }
                        })
                    })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no assignments created on canvas")
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
							history.push({
								pathname: '/error',
								state: {
                                    context: '',
									error: res.error,
									location: "FinalizeResults.js: saveOriginallyAssignedNumbersToDabase()",
								}
							})
						})
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no peer reviews have been completed for this assignment")
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: savePeerReviewsFromCanvasToDatabase() (error came from Canvas)",
                                message: res.message,
                            }
                        })
                    })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no peer reviews assigned for this assignment")
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: saveRubricScoresFromCanvasToDatabase() (error came from Canvas)",
                                message: res.message,
                            }
                        })
                    })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no rubric assessments found for current assignment")
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: sendGradesToCanvas()",
                            }
                        })
                    })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no students found in gradebook SQL table")
                        break;
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
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                error: res.error,
                                location: "FinalizeResults.js: countStudentsInEachBucket()",
                            }
                        })
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
        if (this.state.error) {
            return (
                <div>
                    {this.state.errorMessage}
                </div>
            )
        }
        else if (this.props.pressed) {
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

import React, { Component } from 'react';
import { Boxplot } from 'react-boxplot';
import { Ellipse } from 'react-shapes';
import { Progress, Tooltip } from 'reactstrap';
import { Well, Row, Col } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import Popup from 'reactjs-popup';
import ReactSvgPieChart from "react-svg-piechart";
import SideNav from 'react-simple-sidenav';

import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

var progress = 0;
var progress_num_steps = 15;
var progress_bar_message = "";

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
            penalizing_for_incompletes: false,
            penalizing_for_reassigned: false,
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
        this.error_message = "An error has occurred. Please consult the console to see what has gone wrong"
    }

    attachNamesToDatabase() {
        let data = {
            course_id: this.courseId,
        }

        //Step 8
        fetch('/api/attach_names_in_database', {
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
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to attach actual names to entries in SQL tables")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
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
            assignment_id: this.assignmentId,
            points_possible: this.assignmentInfo.points_possible,
            benchmarks: this.state.benchmarks,
            penalizing_for_incompletes: this.props.penalizingForIncompletes,
            penalizing_for_reassigned: this.props.penalizingForReassigned,
        }

        //Step 5
        fetch('/api/peer_reviews_finalizing', {
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
                                localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.assignmentId, message.num_completed);
                                localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.assignmentId, message.num_assigned);
                                localStorage.setItem("finalizeDisplayTextAverage_" + this.assignmentId, message.average);
                                localStorage.setItem("finalizeDisplayTextOutOf_" + this.assignmentId, message.out_of);
                            })
                            .then(() => this.setProgress(5))
                            .then(() => this.sendGradesToCanvas())
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("there was an error when running the finalize algorithm")
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
            assignment_id: this.assignmentId,
        }

        //Step 15
        fetch('/api/find_completed_all_reviews', {
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
                            localStorage.setItem("completed_all_reviews_" + this.assignmentId, res.completed_all)
                            localStorage.setItem("completed_some_reviews_" + this.assignmentId, res.completed_some)
                            localStorage.setItem("completed_no_reviews_" + this.assignmentId, res.completed_none)
                            this.setProgress(15)
                        })
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("encountered an error when trying to determine stats for completion pie chart")
                        break;
                }
            })
    }

    findFlaggedGrades() {
        let data = {
            assignment_id: this.assignmentId,
        }

        //Step 11
        fetch('/api/find_flagged_grades', {
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
                            localStorage.setItem("flagged_students_" + this.assignmentId, JSON.stringify(res))
                            this.setProgress(11)
                        })
                            .then(() => this.pullBoxPlotFromCanvas())
                        break;
                    case 204:
                        //no flagged grades
                        this.setProgress(10)
                        //Step 12
                        localStorage.setItem("flagged_students_" + this.assignmentId, JSON.stringify([]))
                        this.setProgress(11)
                        this.pullBoxPlotFromCanvas()
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("encountered an error when trying to determine flagged grades")
                        break;
                }
            })
    }

    pullBoxPlotFromCanvas() {
        let data = {
            course_id: this.courseId,
            assignment_id: this.assignmentId
        }

        //Step 13
        fetch('/api/pull_box_plot_from_canvas', {
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
                            localStorage.setItem("min_" + this.assignmentId, data.min_score);
                            localStorage.setItem("q1_" + this.assignmentId, data.first_quartile);
                            localStorage.setItem("median_" + this.assignmentId, data.median);
                            localStorage.setItem("q3_" + this.assignmentId, data.third_quartile);
                            localStorage.setItem("max_" + this.assignmentId, data.max_score);
                            this.setProgress(13)
                        })
                            .then(() => this.findCompletedAllReviews())
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to pull boxplot from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
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
            assignment_id: this.assignmentId,
        }

        //Step 4
        fetch('/api/save_peer_review_numbers', {
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
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("encountered an error when trying to save originally assigned peer review numbers")
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
            course_id: this.courseId,
            assignment_id: this.assignmentId,
            points_possible: this.assignmentInfo.points_possible,
        }

        //Step 2
        fetch('/api/save_all_peer_reviews', {
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
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to save all peer reviews from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
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
            course_id: this.courseId,
            assignment_id: this.assignmentId,
            rubric_settings: this.assignmentInfo.rubric_settings.id
        }

        //Step 3
        fetch('/api/save_all_rubrics', {
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
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to save all rubric assessments from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
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
            course_id: this.courseId,
            assignment_id: this.assignmentId,
        }

        //Step 7
        fetch('/api/send_grades_to_canvas', {
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
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error in sending grades to canvas when reading the actual grade saved in the SQL gradebook")
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
        progress = (step / progress_num_steps) * 100;
        progress_bar_message = [progress.toFixed(0) + "%"]
    }

    countStudentsInEachBucket() {
        //Step 9
        fetch('/api/count_students_in_each_bucket', {
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
                            localStorage.setItem("definitely_harsh_" + this.assignmentId, JSON.stringify(res.definitely_harsh))
                            localStorage.setItem("could_be_harsh_" + this.assignmentId, JSON.stringify(res.could_be_harsh))
                            localStorage.setItem("could_be_lenient_" + this.assignmentId, JSON.stringify(res.could_be_lenient))
                            localStorage.setItem("definitely_lenient_" + this.assignmentId, JSON.stringify(res.definitely_lenient))
                            localStorage.setItem("could_be_fair_" + this.assignmentId, JSON.stringify(res.could_be_fair))
                            localStorage.setItem("definitely_fair_" + this.assignmentId, JSON.stringify(res.definitely_fair))
                            this.setProgress(9)
                        })
                            .then(() => this.findFlaggedGrades())
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("encountered an error when trying to sort students into the seven buckets")
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
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.props.pressed) {
            this.savePeerReviewsFromCanvasToDatabase()
            return (
                <div></div>
            )
        }

        if (localStorage.getItem("completed_all_reviews_" + this.assignmentId)) {
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
                                    { title: "Completed all reviews", value: Number(localStorage.getItem("completed_all_reviews_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Completed some reviews", value: Number(localStorage.getItem("completed_some_reviews_" + this.assignmentId)), color: '#C68100' },
                                    { title: "Completed no reviews", value: Number(localStorage.getItem("completed_no_reviews_" + this.assignmentId)), color: '#AD1F1F' },
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
                                    { title: "Definitely Harsh", value: Number(localStorage.getItem("definitely_harsh_" + this.assignmentId)), color: '#AD1F1F' },
                                    { title: "Could be Harsh", value: Number(localStorage.getItem("could_be_harsh_" + this.assignmentId)), color: '#D6A0A0' },
                                    { title: "Definitely Lenient", value: Number(localStorage.getItem("definitely_lenient_" + this.assignmentId)), color: '#001887' },
                                    { title: "Could be Lenient", value: Number(localStorage.getItem("could_be_lenient_" + this.assignmentId)), color: '#B3BBDD' },
                                    { title: "Definitely Fair", value: Number(localStorage.getItem("definitely_fair_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Could be Fair", value: Number(localStorage.getItem("could_be_fair_" + this.assignmentId)), color: '#94B29A' },
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
                        trigger={<button className="flaggedbutton"> View Flagged Grades ({JSON.parse(localStorage.getItem("flagged_students_" + this.assignmentId)).length})</button>}
                        modal
                        closeOnDocumentClick
                    >
                        <span><h5 className="modaltext">Flagged Grades</h5></span>
                        <hr />
                        <span className="studentlist">
                            {JSON.parse(localStorage.getItem("flagged_students_" + this.assignmentId))}
                        </span>
                    </Popup>
                </div>
            )
        }

        return (
            <Progress value={progress}> {progress_bar_message} </Progress>
        )
    }
}

export default FinalizeResults;
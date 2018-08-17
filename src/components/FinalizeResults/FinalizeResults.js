import React, { Component } from 'react';
import { Boxplot } from 'react-boxplot';
import { Ellipse } from 'react-shapes';
import { Well, Row } from 'react-bootstrap';
import { Progress, Tooltip } from 'reactstrap';
import Flexbox from 'flexbox-react';
import history from '../../history';
import Popup from 'reactjs-popup';
import ReactSvgPieChart from "react-svg-piechart";
import SideNav from 'react-simple-sidenav';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

var progress = 0;
var progress_num_steps = 10;
var progress_bar_message = "";

var message = "";

class FinalizeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipOpen: false,
            finalizeDisplayText: false,
            finishedLoading: false,
            sectorValue1: "",
            sectorValue2: "",
            benchmarks: this.props.benchmarks,
            penalizing_for_incompletes: false,
            penalizing_for_reassigned: false,
            error: false,
        };

        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this)
        this.finalizePeerReviewGrades = this.finalizePeerReviewGrades.bind(this);
        this.findCompletedAllReviews = this.findCompletedAllReviews.bind(this);
        this.findFlaggedGrades = this.findFlaggedGrades.bind(this);
        this.pullBoxPlotFromCanvas = this.pullBoxPlotFromCanvas.bind(this);
        this.saveOriginallyAssignedNumbersToDatabase = this.saveOriginallyAssignedNumbersToDatabase.bind(this);
        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this);
        this.saveRubricScoresFromCanvasToDatabase = this.saveRubricScoresFromCanvasToDatabase.bind(this);
        this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.sortStudentsForAccordion = this.sortStudentsForAccordion.bind(this);
        this.toggle = this.toggle.bind(this);

        this.error_message = "An error has occurred. Please consult the console to see what has gone wrong"
    }

    attachNamesToDatabase() {
        let data = {
            course_id: this.props.courseId,
        }

        fetch('/api/attach_names_in_database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                if (res.status == 204) {
                    this.setProgress(6)
                    this.sortStudentsForAccordion()
                    this.findFlaggedGrades()
                    this.pullBoxPlotFromCanvas()
                    // this.findCompletedAllReviews()
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to attach actual names to entries in SQL tables")
                }
                else if (res.status == 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("there are no students enrolled in this course")
                }
            })
            .catch(err => console.log("unauthorized request when attaching actual names to entries in SQL tables"))
    }

    finalizePeerReviewGrades() {
        let data = {
            assignment_id: this.props.assignmentId,
            points_possible: this.props.assignmentInfo.points_possible,
            benchmarks: this.state.benchmarks,
            penalizing_for_incompletes: this.props.penalizingForIncompletes,
            penalizing_for_reassigned: this.props.penalizingForReassigned,
        }

        fetch('/api/peer_reviews_finalizing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                if (res.status == 200) {
                    res.json().then(res => message = res)
                        .then(() => {
                            this.setProgress(4)
                            localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId, message.num_completed);
                            localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId, message.num_assigned);
                            localStorage.setItem("finalizeDisplayTextAverage_" + this.props.assignmentId, message.average);
                            localStorage.setItem("finalizeDisplayTextOutOf_" + this.props.assignmentId, message.out_of);
                        })
                        .then(() => this.sendGradesToCanvas())
                        .then(() => this.attachNamesToDatabase())
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("there was an error when running the finalize algorithm")
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no peer reviews have been completed for this assignment")
                }
            })
    }

    findCompletedAllReviews() {
        fetch('/api/find_completed_all_reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    res.json()
                        .then(res => {
                            this.setProgress(10)
                            localStorage.setItem("completed_all_reviews_" + this.props.assignmentId, res.completed_all)
                            localStorage.setItem("completed_some_reviews_" + this.props.assignmentId, res.completed_some)
                            localStorage.setItem("completed_no_reviews_" + this.props.assignmentId, res.completed_none)
                        })
                        .then(() => this.setState({
                            finishedLoading: true
                        }))
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("encountered an error when trying to determine stats for completion pie chart")
                }
            })
    }

    findFlaggedGrades() {
        fetch('/api/find_flagged_grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    res.json()
                        .then(res => {
                            this.setProgress(8)
                            localStorage.setItem("flagged_students_" + this.props.assignmentId, JSON.stringify(res))
                        })
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("encountered an error when trying to determine flagged grades")
                }
                else if (res.status == 404) {
                    //no flagged grades
                    this.setProgress(8)
                    localStorage.setItem("flagged_students_" + this.props.assignmentId, JSON.stringify([]))
                }
            })
    }

    pullBoxPlotFromCanvas() {
        let data = {
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId
        }

        fetch('/api/pull_box_plot_from_canvas', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setProgress(9)
                        localStorage.setItem("min_" + this.props.assignmentId, data.min_score);
                        localStorage.setItem("q1_" + this.props.assignmentId, data.first_quartile);
                        localStorage.setItem("median_" + this.props.assignmentId, data.median);
                        localStorage.setItem("q3_" + this.props.assignmentId, data.third_quartile);
                        localStorage.setItem("max_" + this.props.assignmentId, data.max_score);
                    })
                        .then(() => this.findCompletedAllReviews())
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to pull boxplot from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no assignments created on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling boxplot from canvas"))
    }

    saveOriginallyAssignedNumbersToDatabase() {
        let data = {
            assignment_id: this.props.assignmentId,
        }
        fetch('/api/save_peer_review_numbers', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 204) {
                    this.setProgress(3)
                    this.finalizePeerReviewGrades();
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("encountered an error when trying to save originally assigned peer review numbers")
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no peer reviews have been completed for this assignment")
                }
            })
    }

    savePeerReviewsFromCanvasToDatabase() {
        let data = {
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId,
            points_possible: this.props.assignmentInfo.points_possible,
        }

        fetch('/api/save_all_peer_reviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 204) {
                    this.setProgress(1)
                    this.saveRubricScoresFromCanvasToDatabase()
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to save all peer reviews from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no peer reviews assigned for this assignment")
                }
            })
            .catch(err => console.log("unauthorized request when saving all peer reviews from canvas"))

    }

    saveRubricScoresFromCanvasToDatabase() {
        let data = {
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId,
            rubric_settings: this.props.assignmentInfo.rubric_settings.id
        }

        fetch('/api/save_all_rubrics', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 204) {
                    this.setProgress(2)
                    this.saveOriginallyAssignedNumbersToDatabase();
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to save all rubric assessments from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no rubric assessments found for current assignment")
                }
            })
            .catch(err => console.log("unauthorized request when saving all rubric assessments from canvas"))

    }

    sendGradesToCanvas() {
        let data = {
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId,
        }

        fetch('/api/send_grades_to_canvas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                if (res.status == 204) {
                    this.setProgress(5)
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error in sending grades to canvas when reading the actual grade saved in the SQL gradebook")
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no students found in gradebook SQL table")
                }
            })
    }

    setProgress(step) {
        progress = (step / progress_num_steps) * 100;
        progress_bar_message = [progress.toFixed(0) + "%"]
    }

    sortStudentsForAccordion() {
        fetch('/api/sort_students_for_accordion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                if (res.status == 200) {
                    res.json().then(res => {
                        this.setProgress(7)
                        localStorage.setItem("spazzy_" + this.props.assignmentId, JSON.stringify(res.spazzy))
                        localStorage.setItem("definitely_harsh_" + this.props.assignmentId, JSON.stringify(res.definitely_harsh))
                        localStorage.setItem("could_be_harsh_" + this.props.assignmentId, JSON.stringify(res.could_be_harsh))
                        localStorage.setItem("could_be_lenient_" + this.props.assignmentId, JSON.stringify(res.could_be_lenient))
                        localStorage.setItem("definitely_lenient_" + this.props.assignmentId, JSON.stringify(res.definitely_lenient))
                        localStorage.setItem("could_be_fair_" + this.props.assignmentId, JSON.stringify(res.could_be_fair))
                        localStorage.setItem("definitely_fair_" + this.props.assignmentId, JSON.stringify(res.definitely_fair))
                    })
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("encountered an error when trying to sort students into the seven buckets")
                }
            })
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        this.setProgress(0)
    }

    render() {
        if (this.props.pressed) {
            return (
                <div>
                    {
                        this.savePeerReviewsFromCanvasToDatabase()
                    }
                </div>
            )
        }
        else {
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
                                    <SideNav
                                        title="Simple Sidenav"
                                        items={['Item 1', 'Item 2']}
                                        showNav={this.state.showNav}
                                    />
                                    <span className="boxplot" id={"TooltipBoxplot"}>
                                        <Boxplot
                                            width={400} height={25} orientation="horizontal"
                                            min={0} max={100}
                                            stats={{
                                                whiskerLow: localStorage.getItem("min_" + this.props.assignmentId),
                                                quartile1: localStorage.getItem("q1_" + this.props.assignmentId),
                                                quartile2: localStorage.getItem("median_" + this.props.assignmentId),
                                                quartile3: localStorage.getItem("q3_" + this.props.assignmentId),
                                                whiskerHigh: localStorage.getItem("max_" + this.props.assignmentId),
                                                outliers: [],
                                            }} />
                                    </span>
                                    <br></br>
                                    <br></br>
                                    <strong>Completed Peer Reviews:</strong> {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId)}
                                    <br></br>
                                    <br></br>
                                    {/* <strong>Completed All Reviews: </strong>{localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)} / {Number(localStorage.getItem("completed_all_reviews_out_of_" + this.props.assignmentId)) + Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId))} */}
                                    <Tooltip placement="right" delay={{ show: "300" }} isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
                                        <strong>Min Score:</strong> {localStorage.getItem("min_" + this.props.assignmentId)}
                                        <br></br>
                                        <strong>First Quartile:</strong> {localStorage.getItem("q1_" + this.props.assignmentId)}
                                        <br></br>
                                        <strong>Median Score:</strong> {localStorage.getItem("median_" + this.props.assignmentId)}
                                        <br></br>
                                        <strong>Third Quartile:</strong> {localStorage.getItem("q3_" + this.props.assignmentId)}
                                        <br></br>
                                        <strong>Max Score:</strong> {localStorage.getItem("max_" + this.props.assignmentId)}
                                    </Tooltip>

                                    <br></br>
                                    <br></br>

                                    <Row>
                                        <Well className="well2">
                                            <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                                                {/* <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignmentId))} /> */}
                                                {/* <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignmentId))} /> */}
                                                {/* <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignmentId))} /> */}
                                                {/* <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignmentId))} /> */}
                                                {/*<Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId))} /> */}
                                            </Flexbox>
                                            <Popup className="pop-up"
                                                trigger={<button className="button-student"> Flagged Grades </button>}
                                                modal
                                                closeOnDocumentClick
                                            >
                                                <span><h5>Flagged Grades</h5></span>
                                                <hr />
                                                <span>{JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId))}</span>
                                            </Popup>
                                        </Well>
                                    </Row>
                                    <br></br>
                                    <Row>
                                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                            <h5 className="graphTitle">Completion</h5>
                                            <ReactSvgPieChart className="piechart"
                                                expandSize={3}
                                                expandOnHover="false"
                                                data={[
                                                    { value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)), color: '#E38627' },
                                                    { value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignmentId)), color: '#C13C37' },
                                                    { value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignmentId)), color: '#6A2135' },
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        // console.log("value: ", d.value);
                                                        this.state.sectorValue1 = d.value;
                                                    }
                                                }
                                                }
                                            />
                                            <Well>This is the value of the sector over which you are hovering: {this.state.sectorValue1}</Well>
                                            <br />
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#E38627' }} strokeWidth={5} />
                                                <p className="graphKey">Completed all reviews</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#C13C37' }} strokeWidth={5} />
                                                <p className="graphKey">Completed some reviews</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#6A2135' }} strokeWidth={5} />
                                                <p className="graphKey">Completed no reviews</p>
                                            </Row>
                                        </Flexbox>
                                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                            <h5 className="graphTitle">Grading Classification</h5>
                                            <ReactSvgPieChart className="piechart"
                                                expandSize={3}
                                                expandOnHover="false"
                                                data={[
                                                    { value: Number(localStorage.getItem("spazzy_" + this.props.assignmentId)), color: '#C9CBA3' },
                                                    { value: Number(localStorage.getItem("definitely_harsh_" + this.props.assignmentId)), color: '#FFE1A8' },
                                                    { value: Number(localStorage.getItem("could_be_harsh_" + this.props.assignmentId)), color: '#E26D5C' },
                                                    { value: Number(localStorage.getItem("could_be_lenient_" + this.props.assignmentId)), color: '#723D46' },
                                                    { value: Number(localStorage.getItem("definitely_lenient_" + this.props.assignmentId)), color: '#472D30' },
                                                    { value: Number(localStorage.getItem("could_be_fair_" + this.props.assignmentId)), color: '#197278' },
                                                    { value: Number(localStorage.getItem("definitely_fair_" + this.props.assignmentId)), color: '#772E25' }
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        // console.log("value: ", d.value);
                                                        this.state.sectorValue2 = d.value;
                                                    }
                                                }
                                                }
                                            />
                                            <Well>This is the value of the sector over which you are hovering: {this.state.sectorValue2}</Well>
                                            <br />
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#C9CBA3' }} strokeWidth={5} />
                                                <p className="graphKey">Definitely Harsh</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#FFE1A8' }} strokeWidth={5} />
                                                <p className="graphKey">Might be Harsh</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#E26D5C' }} strokeWidth={5} />
                                                <p className="graphKey">Definitely Lenient</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#723D46' }} strokeWidth={5} />
                                                <p className="graphKey">Might be Lenient</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#472D30' }} strokeWidth={5} />
                                                <p className="graphKey">Definitely Fair</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#C197278' }} strokeWidth={5} />
                                                <p className="graphKey">Might be Fair</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#772E25' }} strokeWidth={5} />
                                                <p className="graphKey">Spazzy</p>
                                            </Row>
                                        </Flexbox>
                                    </Row>
                                </div>
                                :
                                <Progress value={progress}> {progress_bar_message} </Progress>
                        }
                    </div>
                )
            }
        }
    }
}

export default FinalizeResults;
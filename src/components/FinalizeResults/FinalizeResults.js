import React, { Component } from 'react';
import { Well, Row } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import Loader from 'react-loader-spinner';
import { Boxplot } from 'react-boxplot';
import { Progress, Tooltip } from 'reactstrap';

import '../Assignments/Assignments.css'

var progress = 0;
var progress_bar_message = "";

var message = "";

class FinalizeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipOpen: false,
            finalizeDisplayText: false,
            finishedLoading: false,
            benchmarks: this.props.benchmarks,
            loaded1: false,
            loaded2: false,
        };

        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this);
        this.saveRubricScoresFromCanvasToDatabase = this.saveRubricScoresFromCanvasToDatabase.bind(this);
        this.saveOriginallyAssignedNumbersToDatabase = this.saveOriginallyAssignedNumbersToDatabase.bind(this);
        this.finalizePeerReviewGrades = this.finalizePeerReviewGrades.bind(this);
        this.sendGradesToCanvas = this.sendGradesToCanvas.bind(this);
        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this)
        this.sortStudentsForAccordion = this.sortStudentsForAccordion.bind(this);
        this.findFlaggedGrades = this.findFlaggedGrades.bind(this);
        this.pullBoxPlotFromCanvas = this.pullBoxPlotFromCanvas.bind(this);
        this.findCompletedAllReviews = this.findCompletedAllReviews.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    savePeerReviewsFromCanvasToDatabase() {
        let data = {
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id,
            points_possible: this.props.assignment_info.points_possible,
        }
        console.log("3: fetching peer review data from canvas")
        fetch('/api/save_all_peer_reviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                progress = 10;
                progress_bar_message = "10%";
                this.saveRubricScoresFromCanvasToDatabase()
            })
    }

    saveRubricScoresFromCanvasToDatabase() {
        let data = {
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id,
            rubric_settings: this.props.assignment_info.rubric_settings.id
        }

        console.log("5: fetching rubric data from canvas");
        fetch('/api/save_all_rubrics', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                progress = 20
                progress_bar_message = "20%";
                this.saveOriginallyAssignedNumbersToDatabase();
            })
    }

    saveOriginallyAssignedNumbersToDatabase() {
        let data = {
            assignment_id: this.props.assignment_id,
        }
        fetch('/api/save_peer_review_numbers', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                progress = 30
                progress_bar_message = "30%";
                this.finalizePeerReviewGrades();
            })
    }

    finalizePeerReviewGrades() {
        let data = {
            assignment_id: this.props.assignment_id,
            points_possible: this.props.assignment_info.points_possible,
            benchmarks: this.state.benchmarks,
        }

        fetch('/api/peer_reviews_finalizing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(res => message = res.message)
            .then(() => {
                progress = 40
                progress_bar_message = "40%";
                localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id, message.num_completed);
                localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id, message.num_assigned);
                localStorage.setItem("finalizeDisplayTextAverage_" + this.props.assignment_id, message.average);
                localStorage.setItem("finalizeDisplayTextOutOf_" + this.props.assignment_id, message.out_of);
            })
            .then(() => this.sendGradesToCanvas())
            .then(() => this.attachNamesToDatabase())
    }

    sendGradesToCanvas() {
        console.log("8: sending grades to canvas");
        let data = {
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id,
        }

        fetch('/api/send_grades_to_canvas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
        progress = 50
        progress_bar_message = "50%";
    }

    attachNamesToDatabase() {
        console.log("10f: attaching names to database tables");
        let data = {
            course_id: this.props.course_id,
        }

        fetch('/api/attach_names_in_database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(() => {
                progress = 60
                progress_bar_message = "60%";
                this.sortStudentsForAccordion()
                this.findFlaggedGrades()
                this.pullBoxPlotFromCanvas()
                // this.findCompletedAllReviews()
            })
    }

    sortStudentsForAccordion() {
        console.log("12: sorting students for accordion")

        fetch('/api/sort_students_for_accordion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(res => {
                progress = 70
                progress_bar_message = "70%";
                localStorage.setItem("harsh_students_" + this.props.assignment_id, JSON.stringify(res.harsh_students))
                localStorage.setItem("lenient_students_" + this.props.assignment_id, JSON.stringify(res.lenient_students))
                localStorage.setItem("some_incomplete_students_" + this.props.assignment_id, JSON.stringify(res.some_incomplete_students))
                localStorage.setItem("all_incomplete_students_" + this.props.assignment_id, JSON.stringify(res.all_incomplete_students))
            })
    }

    findFlaggedGrades() {
        console.log("14: finding flagged grades")

        fetch('/api/find_flagged_grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                progress = 80
                progress_bar_message = "80%";
                localStorage.setItem("flagged_students_" + this.props.assignment_id, JSON.stringify(res))
            })
    }

    pullBoxPlotFromCanvas() {
        let data = {
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id
        }

        console.log("fetching box plot points from canvas")

        fetch('/api/pull_box_plot_from_canvas', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                res.json()
                    .then(result => {
                        progress = 90
                        progress_bar_message = "90%";
                        localStorage.setItem("min_" + this.props.assignment_id, result.min_score);
                        localStorage.setItem("q1_" + this.props.assignment_id, result.first_quartile);
                        localStorage.setItem("median_" + this.props.assignment_id, result.median);
                        localStorage.setItem("q3_" + this.props.assignment_id, result.third_quartile);
                        localStorage.setItem("max_" + this.props.assignment_id, result.max_score);
                    })
                    .then(() => this.findCompletedAllReviews())
            })
    }

    findCompletedAllReviews() {
        fetch('/api/find_completed_all_reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                progress = 100
                progress_bar_message = "100%";
                localStorage.setItem("completed_all_reviews_" + this.props.assignment_id, res.count)
                localStorage.setItem("completed_all_reviews_out_of_" + this.props.assignment_id, res.count2)
            })
            .then(() => this.setState({ finishedLoading: true }))
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        progress = 0;
        progress_bar_message = "";
    }

    render() {
        return (
            <div>
                {
                    this.props.pressed ?
                        <div>
                            {
                                this.savePeerReviewsFromCanvasToDatabase()
                            }
                            {
                                localStorage.getItem("completed_all_reviews_" + this.props.assignment_id) ?
                                    <div>
                                        <strong>Completed Peer Reviews: </strong>{localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}
                                        <br></br>
                                        <br></br>
                                        <strong>Completed All Reviews: </strong>{localStorage.getItem("completed_all_reviews_" + this.props.assignment_id)} / {Number(localStorage.getItem("completed_all_reviews_out_of_" + this.props.assignment_id)) + Number(localStorage.getItem("completed_all_reviews_" + this.props.assignment_id))}
                                        <Boxplot
                                            width={400} height={25} orientation="horizontal"
                                            min={0} max={100}
                                            stats={{
                                                whiskerLow: localStorage.getItem("min_" + this.props.assignment_id),
                                                quartile1: localStorage.getItem("q1_" + this.props.assignment_id),
                                                quartile2: localStorage.getItem("median_" + this.props.assignment_id),
                                                quartile3: localStorage.getItem("q3_" + this.props.assignment_id),
                                                whiskerHigh: localStorage.getItem("max_" + this.props.assignment_id),
                                                outliers: [],
                                            }} />
                                        <br></br>
                                        <Row>
                                            <Well className="well2">
                                                <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                                                    <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignment_id))} />
                                                </Flexbox>
                                            </Well>
                                        </Row>
                                    </div>
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                            }
                        </div>
                        :
                        <div>
                            {
                                localStorage.getItem("completed_all_reviews_" + this.props.assignment_id) ?
                                    // localStorage.getItem("harsh_students_" + this.props.assignment_id) && localStorage.getItem("max_" + this.props.assignment_id) ?
                                    <div>
                                        <strong>Completed Peer Reviews:</strong> {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}
                                        <br></br>
                                        <br></br>
                                        <strong>Completed All Reviews: </strong>{localStorage.getItem("completed_all_reviews_" + this.props.assignment_id)} / {Number(localStorage.getItem("completed_all_reviews_out_of_" + this.props.assignment_id)) + Number(localStorage.getItem("completed_all_reviews_" + this.props.assignment_id))}
                                        <span id={"TooltipBoxplot"}>
                                            <Boxplot
                                                width={400} height={25} orientation="horizontal"
                                                min={0} max={100}
                                                stats={{
                                                    whiskerLow: localStorage.getItem("min_" + this.props.assignment_id),
                                                    quartile1: localStorage.getItem("q1_" + this.props.assignment_id),
                                                    quartile2: localStorage.getItem("median_" + this.props.assignment_id),
                                                    quartile3: localStorage.getItem("q3_" + this.props.assignment_id),
                                                    whiskerHigh: localStorage.getItem("max_" + this.props.assignment_id),
                                                    outliers: [],
                                                }} />
                                        </span>
                                        <Tooltip placement="right" delay={{ show: "300" }} isOpen={this.state.tooltipOpen} target={"TooltipBoxplot"} toggle={this.toggle}>
                                            <strong>Min Score:</strong> {localStorage.getItem("min_" + this.props.assignment_id)}
                                            <br></br>
                                            <strong>First Quartile:</strong> {localStorage.getItem("q1_" + this.props.assignment_id)}
                                            <br></br>
                                            <strong>Median Score:</strong> {localStorage.getItem("median_" + this.props.assignment_id)}
                                            <br></br>
                                            <strong>Third Quartile:</strong> {localStorage.getItem("q3_" + this.props.assignment_id)}
                                            <br></br>
                                            <strong>Max Score:</strong> {localStorage.getItem("max_" + this.props.assignment_id)}
                                        </Tooltip>

                                        <br></br>
                                        <br></br>

                                        <Row>
                                            <Well className="well2">
                                                <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                                                    <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignment_id))} />
                                                    <Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignment_id))} />
                                                </Flexbox>
                                            </Well>
                                        </Row>
                                    </div>
                                    :
                                    <Progress value={progress}> {progress_bar_message} </Progress>
                            }
                        </div>
                }
            </div>
        )
    }
}
export default FinalizeResults;
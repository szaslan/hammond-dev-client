import React, { Component } from 'react';
import { Well, Row } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import Loader from 'react-loader-spinner';
import { Boxplot, computeBoxplotStats } from 'react-boxplot';
import ReactSvgPieChart from "react-svg-piechart";
import Popup from 'reactjs-popup';
import SideNav from 'react-simple-sidenav';
import { Progress, Tooltip } from 'reactstrap';
import '../Assignments/Assignments.css'
import { Rectangle, Circle, Ellipse, Line, Polyline, CornerBox, Triangle } from 'react-shapes';


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
            sectorValue1: "",
            sectorValue2: "",
            benchmarks: this.props.benchmarks,
            penalizing_for_incompletes: false,
            penalizing_for_reassigned: false,
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
            penalizing_for_incompletes: this.props.penalizing_for_incompletes,
            penalizing_for_reassigned: this.props.penalizing_for_reassigned,
        }
        console.log(data)

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
                localStorage.setItem("spazzy_" + this.props.assignment_id, JSON.stringify(res.spazzy))
                localStorage.setItem("definitely_harsh_" + this.props.assignment_id, JSON.stringify(res.definitely_harsh))
                localStorage.setItem("could_be_harsh_" + this.props.assignment_id, JSON.stringify(res.could_be_harsh))
                localStorage.setItem("could_be_lenient_" + this.props.assignment_id, JSON.stringify(res.could_be_lenient))
                localStorage.setItem("definitely_lenient_" + this.props.assignment_id, JSON.stringify(res.definitely_lenient))
                localStorage.setItem("could_be_fair_" + this.props.assignment_id, JSON.stringify(res.could_be_fair))
                localStorage.setItem("definitely_fair_" + this.props.assignment_id, JSON.stringify(res.definitely_fair))
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
                localStorage.setItem("completed_all_reviews_" + this.props.assignment_id, res.completed_all)
                localStorage.setItem("completed_some_reviews_" + this.props.assignment_id, res.completed_some)
                localStorage.setItem("completed_no_reviews_" + this.props.assignment_id, res.completed_none)
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
        let currIndex = 0;
        return (
            <div>
                {this.props.pressed ?
                    <div>
                        {
                            this.fetchPeerReviewData()
                        }

                        {/* {
                                localStorage.getItem("completed_all_reviews_" + this.props.assignment_id) ?
                                    <div>

                                        <strong>Completed Peer Reviews: </strong>{localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}

                                       

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
                                        <br></br>
                                        <br></br>
                                        <Row className="chart-row">
                                            <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                                <h5 className="graphTitle">Completion</h5>
                                                <ReactSvgPieChart className="piechart"
                                                    expandSize={3}
                                                    expandOnHover="false"
                                                    data={[
                                                        { value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignment_id)), color: '#E38627' },
                                                        { value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignment_id)), color: '#C13C37' },
                                                        { value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignment_id)), color: '#6A2135' },
                                                    ]}
                                                    // onSectorHover={() => {
                                                    //     console.log("You hovered over.");
                                                    // }}
                                                    onSectorHover={(d) => {
                                                        if (d) {
                                                            console.log("value: ", d.value);
                                                            // this.sectorValue = d.value;
                                                        }
                                                    }
                                                    }
                                                />
                                                <Well>This is the value of the sector over which you are hovering{this.state.sectorValue1}</Well>
                                            </Flexbox>
                                            <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                                <h5 className="graphTitle">Grading Classification</h5>
                                                <ReactSvgPieChart className="piechart"
                                                    expandSize={3}
                                                    expandOnHover="false"
                                                    data={[
                                                        { value: Number(localStorage.getItem("spazzy_" + this.props.assignment_id)), color: '#C9CBA3' },
                                                        { value: Number(localStorage.getItem("definitely_harsh_" + this.props.assignment_id)), color: '#FFE1A8' },
                                                        { value: Number(localStorage.getItem("could_be_harsh_" + this.props.assignment_id)), color: '#E26D5C' },
                                                        { value: Number(localStorage.getItem("could_be_lenient_" + this.props.assignment_id)), color: '#723D46' },
                                                        { value: Number(localStorage.getItem("definitely_lenient_" + this.props.assignment_id)), color: '#472D30' },
                                                        { value: Number(localStorage.getItem("could_be_fair_" + this.props.assignment_id)), color: '#197278' },
                                                        { value: Number(localStorage.getItem("definitely_fair_" + this.props.assignment_id)), color: '#772E25' }
                                                    ]}
                                                    onSectorHover={(d) => {
                                                        if (d) {
                                                            console.log("value: ", d.value);
                                                            // this.sectorValue = d.value;
                                                        }
                                                    }
                                                    }
                                                />
                                                <Well>This is the value of the sector over which you are hovering{this.state.sectorValueState}</Well>
                                            </Flexbox>
                                        </Row>
                                    </div>
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                            }
                        </div> */}
                    </div>
                    :
                    <div>
                        {
                            localStorage.getItem("completed_all_reviews_" + this.props.assignment_id) ?
                                // localStorage.getItem("harsh_students_" + this.props.assignment_id) && localStorage.getItem("max_" + this.props.assignment_id) ?
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
                                                whiskerLow: localStorage.getItem("min_" + this.props.assignment_id),
                                                quartile1: localStorage.getItem("q1_" + this.props.assignment_id),
                                                quartile2: localStorage.getItem("median_" + this.props.assignment_id),
                                                quartile3: localStorage.getItem("q3_" + this.props.assignment_id),
                                                whiskerHigh: localStorage.getItem("max_" + this.props.assignment_id),
                                                outliers: [],
                                            }} />
                                    </span>
                                    <br></br>
                                    <br></br>
                                    <strong>Completed Peer Reviews:</strong> {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignment_id)}
                                    <br></br>
                                    <br></br>
                                    {/* <strong>Completed All Reviews: </strong>{localStorage.getItem("completed_all_reviews_" + this.props.assignment_id)} / {Number(localStorage.getItem("completed_all_reviews_out_of_" + this.props.assignment_id)) + Number(localStorage.getItem("completed_all_reviews_" + this.props.assignment_id))} */}
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
                                                {/* <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignment_id))} /> */}
                                                {/* <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignment_id))} /> */}
                                                {/* <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignment_id))} /> */}
                                                {/* <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignment_id))} /> */}
                                                {/*<Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignment_id))} /> */}
                                            </Flexbox>
                                            <Popup className="pop-up"
                                                trigger={<button className="button-student"> Flagged Grades </button>}
                                                modal
                                                closeOnDocumentClick
                                            >
                                                <span><h5>Flagged Grades</h5></span>
                                                <hr />
                                                <span>{JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignment_id))}</span>
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
                                                    { value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignment_id)), color: '#E38627' },
                                                    { value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignment_id)), color: '#C13C37' },
                                                    { value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignment_id)), color: '#6A2135' },
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        console.log("value: ", d.value);
                                                        this.state.sectorValue1 = d.value;
                                                    }
                                                }
                                                }
                                            //   <Well>This is the value of the sector over which you are hovering: {this.state.sectorValue1}</Well>
                                            />
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


                                            />
                                            </Flexbox>
                                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                            <h5 className="graphTitle">Grading Classification</h5>
                                            <ReactSvgPieChart className="piechart"
                                                expandSize={3}
                                                expandOnHover="false"
                                                data={[
                                                    { value: Number(localStorage.getItem("spazzy_" + this.props.assignment_id)), color: '#C9CBA3' },
                                                    { value: Number(localStorage.getItem("definitely_harsh_" + this.props.assignment_id)), color: '#FFE1A8' },
                                                    { value: Number(localStorage.getItem("could_be_harsh_" + this.props.assignment_id)), color: '#E26D5C' },
                                                    { value: Number(localStorage.getItem("could_be_lenient_" + this.props.assignment_id)), color: '#723D46' },
                                                    { value: Number(localStorage.getItem("definitely_lenient_" + this.props.assignment_id)), color: '#472D30' },
                                                    { value: Number(localStorage.getItem("could_be_fair_" + this.props.assignment_id)), color: '#197278' },
                                                    { value: Number(localStorage.getItem("definitely_fair_" + this.props.assignment_id)), color: '#772E25' }
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        console.log("value: ", d.value);
                                                        this.state.sectorValue2 = d.value;
                                                    }
                                                }
                                                }
                                            />
                                            <Well>This is the value of the sector over which you are hovering: {this.state.sectorValue2}</Well>
                                            ]}
                                        />
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
                }
            </div>
        )
    }
}
export default FinalizeResults;

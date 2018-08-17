import React, { Component } from 'react';
import { Well, Row, Col } from 'react-bootstrap';
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
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId,
            points_possible: this.props.assignmentInfo.points_possible,
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
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId,
            rubric_settings: this.props.assignmentInfo.rubric_settings.id
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
            assignment_id: this.props.assignmentId,
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
            assignment_id: this.props.assignmentId,
            points_possible: this.props.assignmentInfo.points_possible,
            benchmarks: this.state.benchmarks,
            penalizing_for_incompletes: this.props.penalizingForIncompletes,
            penalizing_for_reassigned: this.props.penalizingForReassigned,
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
                localStorage.setItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId, message.num_completed);
                localStorage.setItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId, message.num_assigned);
                localStorage.setItem("finalizeDisplayTextAverage_" + this.props.assignmentId, message.average);
                localStorage.setItem("finalizeDisplayTextOutOf_" + this.props.assignmentId, message.out_of);
            })
            .then(() => this.sendGradesToCanvas())
            .then(() => this.attachNamesToDatabase())
    }

    sendGradesToCanvas() {
        console.log("8: sending grades to canvas");
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
        progress = 50
        progress_bar_message = "50%";
    }

    attachNamesToDatabase() {
        console.log("10f: attaching names to database tables");
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
                localStorage.setItem("spazzy_" + this.props.assignmentId, JSON.stringify(res.spazzy))
                localStorage.setItem("definitely_harsh_" + this.props.assignmentId, JSON.stringify(res.definitely_harsh))
                localStorage.setItem("could_be_harsh_" + this.props.assignmentId, JSON.stringify(res.could_be_harsh))
                localStorage.setItem("could_be_lenient_" + this.props.assignmentId, JSON.stringify(res.could_be_lenient))
                localStorage.setItem("definitely_lenient_" + this.props.assignmentId, JSON.stringify(res.definitely_lenient))
                localStorage.setItem("could_be_fair_" + this.props.assignmentId, JSON.stringify(res.could_be_fair))
                localStorage.setItem("definitely_fair_" + this.props.assignmentId, JSON.stringify(res.definitely_fair))
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
                localStorage.setItem("flagged_students_" + this.props.assignmentId, JSON.stringify(res))
            })
    }

    pullBoxPlotFromCanvas() {
        let data = {
            course_id: this.props.courseId,
            assignment_id: this.props.assignmentId
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
                        localStorage.setItem("min_" + this.props.assignmentId, result.min_score);
                        localStorage.setItem("q1_" + this.props.assignmentId, result.first_quartile);
                        localStorage.setItem("median_" + this.props.assignmentId, result.median);
                        localStorage.setItem("q3_" + this.props.assignmentId, result.third_quartile);
                        localStorage.setItem("max_" + this.props.assignmentId, result.max_score);
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
                localStorage.setItem("completed_all_reviews_" + this.props.assignmentId, res.completed_all)
                localStorage.setItem("completed_some_reviews_" + this.props.assignmentId, res.completed_some)
                localStorage.setItem("completed_no_reviews_" + this.props.assignmentId, res.completed_none)
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
                            this.savePeerReviewsFromCanvasToDatabase()
                        }

                        {/* {
                                localStorage.getItem("completed_all_reviews_" + this.props.assignmentId) ?
                                    <div>

                                        <strong>Completed Peer Reviews: </strong>{localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId)}



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
                                        <br></br>
                                        <br></br>
                                        <Row>
                                            <Well className="well2">
                                                <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">
                                                    <Accordion name="Definitely Harsh" content={JSON.parse(localStorage.getItem("harsh_students_" + this.props.assignmentId))} />
                                                    <Accordion name="Definitely Lenient" content={JSON.parse(localStorage.getItem("lenient_students_" + this.props.assignmentId))} />
                                                    <Accordion name="Missing Some Peer Reviews" content={JSON.parse(localStorage.getItem("some_incomplete_students_" + this.props.assignmentId))} />
                                                    <Accordion name="Missing All Peer Reviews" content={JSON.parse(localStorage.getItem("all_incomplete_students_" + this.props.assignmentId))} />
                                                    <Accordion name="Flagged Grades" content={JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId))} />
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
                                                        { value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)), color: '#E38627' },
                                                        { value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignmentId)), color: '#C13C37' },
                                                        { value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignmentId)), color: '#6A2135' },
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
                            localStorage.getItem("completed_all_reviews_" + this.props.assignmentId) ?
                                // localStorage.getItem("harsh_students_" + this.props.assignmentId) && localStorage.getItem("max_" + this.props.assignmentId) ?
                                <div>
                                    {/*<SideNav
                                        title="Simple Sidenav"
                                        items={['Item 1', 'Item 2']}
                                        showNav={this.state.showNav}
                                    />*/}
                                    <p className="totalscore"> -/{localStorage.getItem("finalizeDisplayTextOutOf_" + this.props.assignmentId)}pts</p>
                                    <Row className="scoredets">
                                      <p className="stats"> Mean: {localStorage.getItem("finalizeDisplayTextAverage_" + this.props.assignmentId)}</p>
                                      <p className="stats"> High: {localStorage.getItem("max_" + this.props.assignmentId)}</p>
                                      <p className="stats"> Low: {localStorage.getItem("min_" + this.props.assignmentId)}</p>
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
                                    </Row>
                                    <br></br>
                                    <br></br>
                                    <hr className="hr-4"></hr>
                                    <Row>
                                      <p className="pagetext">Completed Peer Reviews: {localStorage.getItem("finalizeDisplayTextNumCompleted_" + this.props.assignmentId)} / {localStorage.getItem("finalizeDisplayTextNumAssigned_" + this.props.assignmentId)}</p>
                                      <p className="date">Date Finalized: {localStorage.getItem("finalized_" + this.props.assignmentId)}</p>
                                    </Row>
                                    <br></br>
                                    <hr className="hr-4"></hr>
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
                                                    {title: "Completed all reviews", value: Number(localStorage.getItem("completed_all_reviews_" + this.props.assignmentId)), color: '#E38627' },
                                                    {title: "Completed some reviews", value: Number(localStorage.getItem("completed_no_reviews_" + this.props.assignmentId)), color: '#C13C37' },
                                                    {title: "Completed no reviews", value: Number(localStorage.getItem("completed_some_reviews_" + this.props.assignmentId)), color: '#6A2135' },
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        console.log("value: ", d.value);
                                                        this.state.sectorValue1 = d.value;
                                                        this.state.sectorTitle1 = d.title;
                                                        this.state.check = true;
                                                    }
                                                }
                                                }
                                            />
                                            <Well className="pieinfo">
                                                {this.state.check ?
                                                    this.state.sectorTitle1 + ": " + this.state.sectorValue1 + " student(s)"
                                                :
                                                "Hover over a sector to display completion data. There may be a slight delay."}
                                                </Well>
                                            <br />
                                            <Row>
                                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#E38627' }} strokeWidth={5} />
                                                <p className="compkey">Completed all reviews</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#C13C37' }} strokeWidth={5} />
                                                <p className="compkey">Completed some reviews</p>
                                            </Row>
                                            <Row>
                                                <Ellipse rx={7} ry={4} fill={{ color: '#6A2135' }} strokeWidth={5} />
                                                <p className="compkey">Completed no reviews</p>
                                            </Row>
                                            </Flexbox>
                                        <Flexbox className="chartbox" flexDirection="column" width="200px" flexWrap="wrap">
                                            <h5 className="graphTitle">Grading Classification</h5>
                                            <ReactSvgPieChart className="piechart"
                                                expandSize={3}
                                                expandOnHover="false"
                                                data={[
                                                    {title: "Definitely harsh", value: Number(localStorage.getItem("definitely_harsh_" + this.props.assignmentId)), color: '#ad1f1f' },
                                                    {title: "Could be harsh", value: Number(localStorage.getItem("could_be_harsh_" + this.props.assignmentId)), color: '#d6a0a0' },
                                                    {title: "Definitely lenient", value: Number(localStorage.getItem("definitely_lenient_" + this.props.assignmentId)), color: '#001887' },
                                                    {title: "Could be lenient", value: Number(localStorage.getItem("could_be_lenient_" + this.props.assignmentId)), color: '#b3bbdd' },
                                                    {title: "Definitely fair", value: Number(localStorage.getItem("definitely_fair_" + this.props.assignmentId)), color: '#063d11' },
                                                    {title: "Could be fair", value: Number(localStorage.getItem("could_be_fair_" + this.props.assignmentId)), color: '#94b29a' },
                                                    {title:"Spazzy", value: Number(localStorage.getItem("spazzy_" + this.props.assignmentId)), color: '#c68100' }
                                                ]}
                                                onSectorHover={(d) => {
                                                    if (d) {
                                                        console.log("value: ", d.value);
                                                        this.state.sectorValue2 = d.value;
                                                        this.state.sectorTitle2 = d.title;
                                                        this.state.check2 = true;
                                                    }
                                                }
                                                }
                                            />
                                            <Well className="pieinfo">
                                            {this.state.check2 ?
                                                this.state.sectorTitle2 + ": " + this.state.sectorValue2 + " student(s)"
                                            :
                                            "Hover over a sector to display grading classification data. There may be a slight delay."}
                                            </Well>
                                                <br />
                                            <div className="legend">
                                            <Row>
                                              <Col>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#ad1f1f' }} strokeWidth={5} />
                                                  <p className="graphKey">Definitely Harsh</p>
                                                </Row>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#d6a0a0' }} strokeWidth={5} />
                                                  <p className="graphKey">Could be Harsh</p>
                                                </Row>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#001887' }} strokeWidth={5} />
                                                  <p className="graphKey">Definitely Lenient</p>
                                                </Row>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#b3bbdd' }} strokeWidth={5} />
                                                  <p className="graphKey">Could be Lenient</p>
                                                </Row>
                                              </Col>
                                              <Col>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#063d11' }} strokeWidth={5} />
                                                  <p className="graphKey">Definitely Fair</p>
                                                </Row>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#94b29a' }} strokeWidth={5} />
                                                  <p className="graphKey">Could be Fair</p>
                                                </Row>
                                                <Row>
                                                  <Ellipse rx={7} ry={4} fill={{ color: '#c68100' }} strokeWidth={5} />
                                                  <p className="graphKey">Spazzy</p>
                                                </Row>
                                              </Col>
                                            </Row>
                                          </div>
                                        </Flexbox>
                                    </Row>
                                  <hr className="hr-4"></hr>
                                    <Popup className="pop-up"
                                        trigger={<button className="flaggedbutton"> View Flagged Grades </button>}
                                        modal
                                        closeOnDocumentClick
                                    >
                                        <span><h5 className="modaltext">Flagged Grades</h5></span>
                                        <hr />
                                        <span className="studentlist">
                                          {JSON.parse(localStorage.getItem("flagged_students_" + this.props.assignmentId))}
                                        </span>
                                    </Popup>
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

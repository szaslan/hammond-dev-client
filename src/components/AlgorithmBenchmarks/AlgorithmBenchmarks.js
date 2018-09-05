import { Col } from 'react-bootstrap';
import { Form, FormGroup, Input, Label, Tooltip } from 'reactstrap';
import React, { Component } from 'react';
import Loader from 'react-loader-spinner'
import '../Assignments/Assignments.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../DueDate/NewDueDate.css'

var downArrowIcon = require('../downArrowIcon.svg')
var upArrowIcon = require('../upArrowIcon.svg')

//tooltip messages for setting benchmarks
const SPAZZY_WIDTH_message = "";
const THRESHOLD_message = "The maximum amount that a calculated grade can vary between two iterations of the grading algorithm, without requiring another iteration. Recommended value: 0.001";
const COULD_BE_LOWER_BOUND_message = "The minimum weight before being classified into one of the three extreme buckets. Recommended value: 0.70";
const COULD_BE_UPPER_BOUND_message = "The maximum weight before being classified as Definitely Fair. Recommended value: 2.00";
const MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_message = "The minimum number of reviews that a student must complete in this course before the student can be classified into a 'Definitive' category";
const MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_message = "The minimum number of assignments in a course before a student can be classified into a 'Definitive' category";
const MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message = "The minimum number of reviews completed for a submission to be graded accurately";
const MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION_message = "The minimum percentage of completed reviews for this submission to be graded accurately";

class AlgorithmBenchmarks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            advancedOpen: false,
            loaded: false,
            COULD_BE_LOWER_BOUND: null,
            COULD_BE_LOWER_BOUND_tooltipOpen: false,
            COULD_BE_UPPER_BOUND: null,
            COULD_BE_UPPER_BOUND_tooltipOpen: false,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: null,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_tooltipOpen: false,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: null,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen: false,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: null,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_tooltipOpen: false,
            MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION: null,
            MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION_tooltipOpen: false,
            THRESHOLD: null,
            THRESHOLD_tooltipOpen: false,
            saved: false,
            SPAZZY_WIDTH: null,
            SPAZZY_WIDTH_tooltipOpen: false,
        };

        this.handleAdvancedClick = this.handleAdvancedClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);

        this.assignmentId = this.props.assignmentId;
        this.benchmarks = this.props.benchmarks;
        this.courseId = this.props.courseId;
        this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
        this.originalBenchmarks = this.props.originalBenchmarks;
    }

    handleAdvancedClick() {
        this.setState({
            advancedOpen: !this.state.advancedOpen
        })
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleReset(event) {
        event.preventDefault();

        //reset back to the original benchmark
        this.setState({
            [event.target.name]: this.originalBenchmarks[event.target.name]
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        Object.keys(this.benchmarks).forEach(benchmark => {
            var value = this.state[benchmark];
            localStorage.setItem(benchmark + this.localStorageExtension, value)
        });
        localStorage.setItem("customBenchmarksSaved" + this.localStorageExtension, true)
        this.setState({
            saved: true
        })
    }

    toggle(event) {
        this.setState({
            [event.target.name + "_tooltipOpen"]: !this.state[event.target.name + "_tooltipOpen"]
        })
    }

    componentDidMount() {
        console.log(this.benchmarks)
        Object.keys(this.benchmarks).forEach((benchmark, index, array) => {
            var value = this.benchmarks[benchmark];
            this.setState({
                [benchmark]: value,
            })

            if (index == array.length - 1) {
                this.setState({
                    loaded: true,
                })
            }
        });
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    {/* list of basic benchmarks to be set by user */}
                    <hr className="hr-7"></hr>
                    <Form className="parameters">
                        <FormGroup row>
                            <Col sm={8}>
                                <Label className="parameter" >
                                    Minimum Number of Reviews (per student) for Classification:
                                </Label>
                            </Col>
                            <Col sm={3}>
                                <Input type="number" name="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" id="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION} min={0} step={1} />
                            </Col>
                            <Col sm={1}>
                                <button className="reset-button" name="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" onClick={this.handleReset}>Reset</button>
                                <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_tooltipOpen} target={"MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION"} toggle={this.toggle}>
                                    {MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_message}
                                </Tooltip>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col sm={8}>
                                <Label className="parameter" >
                                    Minimum Number of Assignments (per course) for Classification:
                                </Label>
                            </Col>
                            <Col sm={3}>
                                <Input type="number" name="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" id="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION} min={0} step={1} />
                            </Col>
                            <Col sm={1}>
                                <button className="reset-button" name="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" onClick={this.handleReset}>Reset</button>
                                <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_tooltipOpen} target={"MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION"} toggle={this.toggle}>
                                    {MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_message}
                                </Tooltip>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col sm={8}>
                                <Label className="parameter" >
                                    Minimum Number of Reviews (per submission) for Grading:
                                </Label>
                            </Col>
                            <Col sm={3}>
                                <Input type="number" name="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" id="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING} min={0} step={1} />
                            </Col>
                            <Col sm={1}>
                                <button className="reset-button" name="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onClick={this.handleReset}>Reset</button>
                                <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen} target={"MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"} toggle={this.toggle}>
                                    {MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message}
                                </Tooltip>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col sm={8}>
                                <Label className="parameter" >
                                    Minimum Completion Percentage for Accurrate Grade Calculating:
                                </Label>
                            </Col>
                            <Col sm={3}>
                                <Input type="number" name="MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION" id="MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION" onChange={this.handleChange} value={this.state.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION} min={0} max={1} step={.001} />
                            </Col>
                            <Col sm={1}>
                                <button className="reset-button" name="MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION" onClick={this.handleReset}>Reset</button>
                                <Tooltip placement="right" isOpen={this.state.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION_tooltipOpen} target={"MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION"} toggle={this.toggle}>
                                    {MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION_message}
                                </Tooltip>
                            </Col>
                        </FormGroup>
                    </Form>
                    {
                        //advanced settings, to be opened by user with dropdown
                        this.state.advancedOpen ?
                            <div>
                                <span className="advanced-button" onClick={this.handleAdvancedClick}>
                                    Advanced
                                <img src={upArrowIcon} width="20" alt="up arrow" />
                                </span>
                                <Form>
                                <hr className="hr-7"></hr>
                                    <FormGroup row>
                                        <Col sm={5}>
                                            <Label className="parameter">
                                                Width of Standard Deviation Range:
                                            </Label>
                                        </Col>
                                        <Col sm={3}>
                                            <Input className="advanced-input" type="number" name="SPAZZY_WIDTH" id="SPAZZY_WIDTH" onChange={this.handleChange} value={this.state.SPAZZY_WIDTH} min={0} step={0.01} />
                                        </Col>
                                        <Col sm={1}>
                                            <button className="reset-button2" name="SPAZZY_WIDTH" onClick={this.handleReset}>Reset</button>
                                            <Tooltip placement="right" isOpen={this.state.SPAZZY_WIDTH_tooltipOpen} target={"SPAZZY_WIDTH"} toggle={this.toggle}>
                                                {SPAZZY_WIDTH_message}
                                            </Tooltip>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col sm={5}>
                                            <Label className="parameter" >
                                                Threshold:
                                            </Label>
                                        </Col>
                                        <Col sm={3}>
                                            <Input className="advanced-input" type="number" name="THRESHOLD" id="THRESHOLD" onChange={this.handleChange} value={this.state.THRESHOLD} min={0} step={.0001} />
                                        </Col>
                                        <Col sm={1}>
                                            <button className="reset-button2" name="THRESHOLD" onClick={this.handleReset}>Reset</button>
                                            <Tooltip placement="right" isOpen={this.state.THRESHOLD_tooltipOpen} target={"THRESHOLD"} toggle={this.toggle}>
                                                {THRESHOLD_message}
                                            </Tooltip>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col sm={5}>
                                            <Label className="parameter" >
                                                "Could Be" Lower Bound:
                                            </Label>
                                        </Col>
                                        <Col sm={3}>
                                            <Input className="advanced-input" type="number" name="COULD_BE_LOWER_BOUND" id="COULD_BE_LOWER_BOUND" onChange={this.handleChange} value={this.state.COULD_BE_LOWER_BOUND} min={0} max={1} step={.01} />
                                        </Col>
                                        <Col sm={1}>
                                            <button className="reset-button2" name="COULD_BE_LOWER_BOUND" onClick={this.handleReset}>Reset</button>
                                            <Tooltip placement="right" isOpen={this.state.COULD_BE_LOWER_BOUND_tooltipOpen} target={"COULD_BE_LOWER_BOUND"} toggle={this.toggle}>
                                                {COULD_BE_LOWER_BOUND_message}
                                            </Tooltip>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col sm={5}>
                                            <Label className="parameter" >
                                                "Could Be" Upper Bound:
                                            </Label>
                                        </Col>
                                        <Col sm={3}>
                                            <Input className="advanced-input" type="number" name="COULD_BE_UPPER_BOUND" id="COULD_BE_UPPER_BOUND" onChange={this.handleChange} value={this.state.COULD_BE_UPPER_BOUND} min={1} max={5} step={.01} />
                                        </Col>
                                        <Col sm={1}>
                                            <button className="reset-button2" name="COULD_BE_UPPER_BOUND" onClick={this.handleReset}>Reset</button>
                                            <Tooltip placement="right" isOpen={this.state.COULD_BE_UPPER_BOUND_tooltipOpen} target={"COULD_BE_UPPER_BOUND"} toggle={this.toggle}>
                                                {COULD_BE_UPPER_BOUND_message}
                                            </Tooltip>
                                        </Col>
                                    </FormGroup>
                                </Form>
                            </div>
                            :
                            <span className="advanced-button" onClick={this.handleAdvancedClick}>
                                Advanced
                                <img src={downArrowIcon} width="20" alt="down arrow" />
                            </span>
                    }
                    <FormGroup row>
                        <button className="save-all" onClick={this.handleSubmit}> Save All</button>
                    </FormGroup>
                </div>
            );
        }

        return (
            <div></div>
        )
    }
}

export default AlgorithmBenchmarks;

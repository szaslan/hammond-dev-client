import React, { Component } from 'react';
import { Tooltip } from 'reactstrap';
import Loader from 'react-loader-spinner'

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

const WIDTH_OF_STD_DEV_RANGE_message = "";
const THRESHOLD_message = "The maximum amount that the calculated grade on a submission can vary between two iterations of the grading algorithm without requiring another iteration. Recommended value: 0.001";
const COULD_BE_LOWER_BOUND_message = "The minimum weight to not be classified into one of the three extreme buckets. Recommended value: 0.70";
const COULD_BE_UPPER_BOUND_message = "The maximum weight to not be classified as Definitely Fair. Recommended value: 2.00";
const MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_message = "";
const MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_message = "";
const MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message = "";
const MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message = "";

class AlgorithmBenchmarks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            COULD_BE_LOWER_BOUND: null,
            COULD_BE_LOWER_BOUND_tooltipOpen: false,
            COULD_BE_UPPER_BOUND: null,
            COULD_BE_UPPER_BOUND_tooltipOpen: false,
            loaded: false,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: null,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_tooltipOpen: false,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: null,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen: false,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: null,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_tooltipOpen: false,
            MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: null,
            MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen: false,
            THRESHOLD: null,
            THRESHOLD_tooltipOpen: false,
            WIDTH_OF_STD_DEV_RANGE: null,
            WIDTH_OF_STD_DEV_RANGE_tooltipOpen: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);

        this.assignmentId = this.props.assignmentId
        this.benchmarks = this.props.benchmarks
        this.originalBenchmarks = this.props.originalBenchmarks
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleClear(event) {
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
            localStorage.setItem(benchmark + "_" + this.assignmentId, value)
        });
        localStorage.setItem("customBenchmarksSaved_" + this.assignmentId, true)
    }

    toggle(event) {
        this.setState({
            [event.target.name + "_tooltipOpen"]: !this.state[event.target.name + "_tooltipOpen"]
        })
    }

    componentDidMount() {
        Object.keys(this.benchmarks).forEach(benchmark => {
            var value = this.benchmarks[benchmark];
            this.setState({
                [benchmark]: value,
            })
        });

        this.setState({
            loaded: true,
        })
    }

    render() {
        if (this.state.loaded) {
            return (
                <form>
                    <label>
                        WIDTH_OF_STD_DEV_RANGE:
                        <input type="number" name="WIDTH_OF_STD_DEV_RANGE" id="WIDTH_OF_STD_DEV_RANGE" onChange={this.handleChange} value={this.state.WIDTH_OF_STD_DEV_RANGE} min={0} step={0.01} />
                        <button className="clear" name="WIDTH_OF_STD_DEV_RANGE" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.WIDTH_OF_STD_DEV_RANGE_tooltipOpen} target={"WIDTH_OF_STD_DEV_RANGE"} toggle={this.toggle}>
                            {WIDTH_OF_STD_DEV_RANGE_message}
                        </Tooltip>
                    </label>
                    <label>
                        THRESHOLD:
                        <input type="number" name="THRESHOLD" id="THRESHOLD" onChange={this.handleChange} value={this.state.THRESHOLD} min={0} step={.0001} />
                        <button className="clear" name="THRESHOLD" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.THRESHOLD_tooltipOpen} target={"THRESHOLD"} toggle={this.toggle}>
                            {THRESHOLD_message}
                        </Tooltip>
                    </label>
                    <label>
                        COULD_BE_LOWER_BOUND:
						<input type="number" name="COULD_BE_LOWER_BOUND" id="COULD_BE_LOWER_BOUND" onChange={this.handleChange} value={this.state.COULD_BE_LOWER_BOUND} min={0} max={1} step={.01} />
                        <button className="clear" name="COULD_BE_LOWER_BOUND" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.COULD_BE_LOWER_BOUND_tooltipOpen} target={"COULD_BE_LOWER_BOUND"} toggle={this.toggle}>
                            {COULD_BE_LOWER_BOUND_message}
                        </Tooltip>
                    </label>
                    <label>
                        COULD_BE_UPPER_BOUND:
						<input type="number" name="COULD_BE_UPPER_BOUND" id="COULD_BE_UPPER_BOUND" onChange={this.handleChange} value={this.state.COULD_BE_UPPER_BOUND} min={1} max={5} step={.01} />
                        <button className="clear" name="COULD_BE_UPPER_BOUND" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.COULD_BE_UPPER_BOUND_tooltipOpen} target={"COULD_BE_UPPER_BOUND"} toggle={this.toggle}>
                            {COULD_BE_UPPER_BOUND_message}
                        </Tooltip>
                    </label>
                    <label>
                        MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION:
						<input type="number" name="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" id="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION} min={0} step={1} />
                        <button className="clear" name="MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_tooltipOpen} target={"MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION"} toggle={this.toggle}>
                            {MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION_message}
                        </Tooltip>
                    </label>
                    <label>
                        MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION:
						<input type="number" name="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" id="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION} min={0} step={1} />
                        <button className="clear" name="MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_tooltipOpen} target={"MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION"} toggle={this.toggle}>
                            {MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION_message}
                        </Tooltip>
                    </label>
                    <label>
                        MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING:
						<input type="number" name="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" id="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onChange={this.handleChange} value={this.state.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING} min={0} step={1} />
                        <button className="clear" name="MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen} target={"MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"} toggle={this.toggle}>
                            {MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message}
                        </Tooltip>
                    </label>
                    <label>
                        MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING:
						<input type="number" name="MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" id="MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onChange={this.handleChange} value={this.state.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING} min={0} max={1} step={.001} />
                        <button className="clear" name="MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING" onClick={this.handleClear}>Clear</button>
                        <Tooltip placement="right" isOpen={this.state.MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_tooltipOpen} target={"MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING"} toggle={this.toggle}>
                            {MIN_RATIO_OF_COMPLETED_TO_ASSIGNED_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING_message}
                        </Tooltip>
                    </label>
                    <button className="save-all" onClick={this.handleSubmit}> Save All</button>
                    <br></br>
                </form>
            );
        }
        
        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}
export default AlgorithmBenchmarks;
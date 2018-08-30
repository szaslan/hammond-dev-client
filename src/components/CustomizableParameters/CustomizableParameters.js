import React, { Component } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';

import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import { benchmarkNames, defaultBenchmarks } from '../AnalyzeButton/AnalyzeButton';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';
import '../DueDate/NewDueDate.css';

const customizableOptions = ["sendIncompleteMessages", "customBenchmarks", "penalizingForOriginalIncompletes", "penalizingForReassignedIncompletes"];

class CustomizableParameters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignmentId: this.props.assignmentId,
            customBenchmarks: false,
            loaded: false,
            penalizingForOriginalIncompletes: false,
            penalizingForReassignedIncompletes: false,
            sendIncompleteMessages: false,
            tooltipOpen: false,
        };

        this.clearCustomBenchmarks = this.clearCustomBenchmarks.bind(this);
        this.editingBenchmarks = this.editingBenchmarks.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.readInFromLocalStorage = this.readInFromLocalStorage.bind(this);
        this.toggle = this.toggle.bind(this);

        // defaultBenchmarks = defaultBenchmarks;
        this.userInputBenchmarks = {
            SPAZZY_WIDTH: defaultBenchmarks.SPAZZY_WIDTH,
            THRESHOLD: defaultBenchmarks.THRESHOLD,
            COULD_BE_LOWER_BOUND: defaultBenchmarks.COULD_BE_LOWER_BOUND,
            COULD_BE_UPPER_BOUND: defaultBenchmarks.COULD_BE_UPPER_BOUND,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
            MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION: defaultBenchmarks.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION,
        }
    }

    clearCustomBenchmarks() {
        localStorage.removeItem("customBenchmarks_" + this.state.assignmentId)

        benchmarkNames.forEach(benchmark => {
            if (localStorage.getItem(benchmark + "_" + this.state.assignmentId)) {
                localStorage.removeItem(benchmark + "_" + this.state.assignmentId);
            }
        })

        this.userInputBenchmarks = {
            SPAZZY_WIDTH: defaultBenchmarks.SPAZZY_WIDTH,
            THRESHOLD: defaultBenchmarks.THRESHOLD,
            COULD_BE_LOWER_BOUND: defaultBenchmarks.COULD_BE_LOWER_BOUND,
            COULD_BE_UPPER_BOUND: defaultBenchmarks.COULD_BE_UPPER_BOUND,
            MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
            MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
            MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
            MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION: defaultBenchmarks.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION,
        }
    }

    editingBenchmarks(event) {
        event.preventDefault();
        localStorage.removeItem("customBenchmarksSaved_" + this.state.assignmentId)
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (value) {
            localStorage.setItem(name + "_" + this.state.assignmentId, value)
        }
        else {
            localStorage.removeItem(name + "_" + this.state.assignmentId)
        }

        this.setState({
            [name]: value,
        });
    }

    readInFromLocalStorage() {
        customizableOptions.forEach(variable => {
            if (localStorage.getItem(variable + "_" + this.state.assignmentId)) {
                if (!this.state[variable]) {
                    this.setState({
                        [variable]: true,
                    })
                }
            }
            else {
                if (this.state[variable]) {
                    this.setState({
                        [variable]: false
                    })
                }
            }
        })
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        this.readInFromLocalStorage();
        this.setState({
            assignmentId: this.props.assignmentId,
            loaded: true,
        })
    }

    componentDidUpdate() {
        this.readInFromLocalStorage();
    }

    render() {
        if (this.state.loaded) {
            return (
                <Form className = "parametersForm">
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="pagetext" check>
                                <Input name="sendIncompleteMessages" type="checkbox" checked={this.state.sendIncompleteMessages} onChange={this.handleInputChange} />
                                Send Messages to All Students Who Have Incomplete Peer Reviews At Due Date 1?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="pagetext" check>
                                <Input name="penalizingForOriginalIncompletes" type="checkbox" checked={this.state.penalizingForOriginalIncompletes} onChange={this.handleInputChange} />
                                Penalize Students Weights For Incomplete Peer Reviews?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="pagetext" check>
                                <Input name="penalizingForReassignedIncompletes" type="checkbox" checked={this.state.penalizingForReassignedIncompletes} onChange={this.handleInputChange} />
                                Penalize For Peer Reviews That Were Reassigned, But Not Completed?:
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="pagetext" check>
                                <Input name="customBenchmarks" type="checkbox" checked={this.state.customBenchmarks} onChange={this.handleInputChange} />
                                Custom Benchmarks For Grading Algorithm?
                            </Label>
                        </FormGroup>
                        {
                            this.state.customBenchmarks ?
                                localStorage.getItem("customBenchmarksSaved_" + this.state.assignmentId) ?
                                    <button onClick={this.editingBenchmarks}>Edit</button>
                                    :
                                    <div>
                                        <AlgorithmBenchmarks originalBenchmarks={defaultBenchmarks} benchmarks={this.userInputBenchmarks} assignmentId={this.state.assignmentId} />
                                        <button className="clear-local-button" onClick={this.clearCustomBenchmarks}> Clear All</button>
                                    </div>
                                :
                                null
                        }
                    </FormGroup>
                </Form>
            );
        }
        else {
            return (
                <div></div>
            )
        }
    }
}
export default CustomizableParameters;

import React, { Component } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';

import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import { benchmarkNames, defaultBenchmarks } from '../AnalyzeButton/AnalyzeButton';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';
import '../DueDate/NewDueDate.css';

const customizableOptions = ["automaticallyFinalize", "customBenchmarks", "penalizingForOriginalIncompletes", "penalizingForReassignedIncompletes", "sendIncompleteMessages"];

class CustomizableParameters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignmentId: this.props.assignmentId,
            automaticallyFinalize: false,
            customBenchmarks: false,
            customBenchmarksSaved: false,
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
        // this.userInputBenchmarks = {
        //     SPAZZY_WIDTH: defaultBenchmarks.SPAZZY_WIDTH,
        //     THRESHOLD: defaultBenchmarks.THRESHOLD,
        //     COULD_BE_LOWER_BOUND: defaultBenchmarks.COULD_BE_LOWER_BOUND,
        //     COULD_BE_UPPER_BOUND: defaultBenchmarks.COULD_BE_UPPER_BOUND,
        //     MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_PER_STUDENT_FOR_CLASSIFICATION,
        //     MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION: defaultBenchmarks.MIN_NUMBER_OF_ASSIGNMENTS_IN_COURSE_FOR_CLASSIFICATION,
        //     MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING: defaultBenchmarks.MIN_NUMBER_OF_REVIEWS_FOR_SINGLE_SUBMISSION_FOR_GRADING,
        //     MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION: defaultBenchmarks.MIN_REVIEW_COMPLETION_PERCENTAGE_PER_SUBMISSION,
        // }
        this.userInputBenchmarks = this.props.userInputBenchmarks;
    }

    clearCustomBenchmarks() {
        localStorage.setItem("customBenchmarks_" + this.state.assignmentId, "N/A")

        benchmarkNames.forEach(benchmark => {
            localStorage.setItem(benchmark + "_" + this.state.assignmentId, "N/A");
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
        localStorage.setItem("customBenchmarksSaved_" + this.state.assignmentId, "N/A")
        this.setState({
            customBenchmarksSaved: false
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        if (value) {
            localStorage.setItem(name + "_" + this.state.assignmentId, value)
        }
        else {
            localStorage.setItem(name + "_" + this.state.assignmentId, "N/A")
        }

        this.setState({
            [name]: value,
        });
    }

    readInFromLocalStorage() {
        customizableOptions.forEach((variable, index, array) => {
            let value = localStorage.getItem(variable + "_" + this.state.assignmentId);
            if (value === "true") {
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

            //to re render the page
            if (index == array.length - 1) {
                this.setState({
                    loaded: true
                })
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

        setInterval(this.readInFromLocalStorage, 1000)
        this.setState({
            loaded: true,
        })
    }

    render() {
        if (this.state.loaded) {
            return (
                <Form className="parametersForm">
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="automaticallyFinalize" type="checkbox" checked={this.state.automaticallyFinalize} onChange={this.handleInputChange} />
                                Automatically Finalize Before Due Date 3 If All Peer Reviews Are Completed?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="sendIncompleteMessages" type="checkbox" checked={this.state.sendIncompleteMessages} onChange={this.handleInputChange} />
                                Send Messages to All Students Who Have Incomplete Peer Reviews At Due Date 1?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="penalizingForOriginalIncompletes" type="checkbox" checked={this.state.penalizingForOriginalIncompletes} onChange={this.handleInputChange} />
                                Penalize Students Weights For Incomplete Peer Reviews?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="penalizingForReassignedIncompletes" type="checkbox" checked={this.state.penalizingForReassignedIncompletes} onChange={this.handleInputChange} />
                                Penalize For Peer Reviews That Were Reassigned, But Not Completed?:
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="customBenchmarks" type="checkbox" checked={this.state.customBenchmarks} onChange={this.handleInputChange} />
                                Custom Benchmarks For Grading Algorithm?
                            </Label>
                        </FormGroup>
                        {
                            this.state.customBenchmarks ?
                                localStorage.getItem("customBenchmarksSaved_" + this.state.assignmentId) === "true" ?
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

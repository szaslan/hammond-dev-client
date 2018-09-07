import React, { Component } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import Flexbox from 'flexbox-react';
import AlgorithmBenchmarks from '../AlgorithmBenchmarks/AlgorithmBenchmarks';
import { benchmarkNames, defaultBenchmarks } from '../AnalyzeButton/AnalyzeButton';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';
import '../DueDate/NewDueDate.css';
import { masterSetLocalStorage } from '../../App';

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

        this.courseId = this.props.courseId;
        this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
        this.userInputBenchmarks = this.props.userInputBenchmarks;
    }

    clearCustomBenchmarks() {
        masterSetLocalStorage("customBenchmarks" + this.localStorageExtension, "N/A")

        benchmarkNames.forEach(benchmark => {
            masterSetLocalStorage(benchmark + this.localStorageExtension, "N/A");

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
        masterSetLocalStorage("customBenchmarksSaved" + this.localStorageExtension, "N/A")

        this.setState({
            customBenchmarksSaved: false
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        if (value) {
            masterSetLocalStorage(name + this.localStorageExtension, value)

        }
        else {
            masterSetLocalStorage(name + this.localStorageExtension, "N/A")

        }

        this.setState({
            [name]: value,
        });
    }

    readInFromLocalStorage() {
        customizableOptions.forEach((variable, index, array) => {
            let value = localStorage.getItem(variable + this.localStorageExtension);
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
                <Form className="parameters-form">
                    <FormGroup row className="param-row">
                        <h3 className="parameters-title"> Customizable Parameters for Grading</h3>
                        <hr className="hr-3"></hr>
                        <FormGroup check>
                            {/* checkbox parameters for assignments */}
                            <Label className="check-text" check>
                                <Input name="automaticallyFinalize" type="checkbox" checked={this.state.automaticallyFinalize} onChange={this.handleInputChange} />
                                Automatically Finalize Before Due Date 3 If All Peer Reviews Are Completed?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row className="param-row">
                        <FormGroup check>
                            <Label className="check-text" check>
                                <Input name="sendIncompleteMessages" type="checkbox" checked={this.state.sendIncompleteMessages} onChange={this.handleInputChange} />
                                Send Messages to All Students Who Have Incomplete Peer Reviews At Due Date 1?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row className="param-row">
                        <FormGroup check>
                            <Label className="check-text" check>
                                <Input name="penalizingForOriginalIncompletes" type="checkbox" checked={this.state.penalizingForOriginalIncompletes} onChange={this.handleInputChange} />
                                Penalize Students Weights For Originally Incomplete Peer Reviews?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row className="param-row">
                        <FormGroup check>
                            <Label className="check-text" check>
                                <Input name="penalizingForReassignedIncompletes" type="checkbox" checked={this.state.penalizingForReassignedIncompletes} onChange={this.handleInputChange} />
                                Penalize For Peer Reviews That Were Reassigned, But Not Completed?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    <FormGroup row className="param-row">
                        <FormGroup check>
                            <Label className="check-text" check>
                                <Input name="customBenchmarks" type="checkbox" checked={this.state.customBenchmarks} onChange={this.handleInputChange} />
                                Custom Benchmarks For Grading Algorithm?
                            </Label>
                        </FormGroup>
                        {
                            this.state.customBenchmarks ?
                                localStorage.getItem("customBenchmarksSaved" + this.localStorageExtension) === "true" ?
                                    <button onClick={this.editingBenchmarks}>Edit</button>
                                    :
                                    <div>
                                        {/* <button className="save-all" onClick={this.handleSubmit}> Save All</button> */}
                                        <AlgorithmBenchmarks originalBenchmarks={defaultBenchmarks} benchmarks={this.userInputBenchmarks} assignmentId={this.state.assignmentId} courseId={this.courseId} />
                                        <Flexbox className="custparam-flexbox" width="300px" justifyContent="space-between">
                                            <button className="custparam-button" onClick={this.handleSubmit}> Save All</button>
                                            <button className="custparam-button" onClick={this.clearCustomBenchmarks}> Clear All</button>
                                        </Flexbox>
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

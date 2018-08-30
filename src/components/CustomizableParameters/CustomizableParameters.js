import React, { Component } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';
import '../DueDate/NewDueDate.css';

const customizableOptions = ["sendIncompleteMessages", "customBenchmarks", "penalizingForIncompletes", "penalizingForReassigned"];

class CustomizableParameters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignmentId: this.props.assignmentId,
            customBenchmarks: false,
            loaded: false,
            penalizingForIncompletes: false,
            penalizingForReassigned: false,
            sendIncompleteMessages: false
        };

        this.editingBenchmarks = this.editingBenchmarks.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.readInFromLocalStorage = this.readInFromLocalStorage.bind(this);

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
            if (name == "penalizingForIncompletes") {
                localStorage.removeItem("penalizingForReassigned" + "_" + this.state.assignmentId)
                this.setState({
                    "penalizingForReassigned": false,
                })
            }
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
                <Form>
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
                                <Input name="customBenchmarks" type="checkbox" checked={this.state.customBenchmarks} onChange={this.handleInputChange} />
                                Custom Benchmarks For Grading Algorithm?
                            </Label>
                        </FormGroup>
                        {
                            this.state.customBenchmarks && localStorage.getItem("customBenchmarksSaved_" + this.state.assignmentId) ?
                                <button onClick={this.editingBenchmarks}>Edit</button>
                                :
                                null
                        }
                    </FormGroup>
                    <FormGroup row>
                        <FormGroup check>
                            <Label className="checktext" check>
                                <Input name="penalizingForIncompletes" type="checkbox" checked={this.state.penalizingForIncompletes} onChange={this.handleInputChange} />
                                Penalize Students Weights For Incomplete Peer Reviews?
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    {
                        this.state.penalizingForIncompletes ?
                            <FormGroup row>
                                <FormGroup check>
                                    <Label className="checktext" check>
                                        <Input name="penalizingForReassigned" type="checkbox" checked={this.state.penalizingForReassigned} onChange={this.handleInputChange} />
                                        Penalize For Peer Reviews That Were Reassigned, But Not Completed?:
                                    </Label>
                                </FormGroup>
                            </FormGroup>
                            :
                            null
                    }
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

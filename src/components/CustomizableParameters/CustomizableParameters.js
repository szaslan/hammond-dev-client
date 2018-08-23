import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

const customizable_options = ["send_incomplete_messages", "custom_benchmarks", "penalizing_for_incompletes", "penalizing_for_reassigned"];

class CustomizableParameters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignment_id: null,
            custom_benchmarks: false,
            loaded: false,
            penalizing_for_incompletes: false,
            penalizing_for_reassigned: false,
            send_incomplete_messages: false
        };

        this.editingBenchmarks = this.editingBenchmarks.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.readInFromLocalStorage = this.readInFromLocalStorage.bind(this);

    }

    editingBenchmarks(event) {
        event.preventDefault();
        localStorage.removeItem("custom_benchmarks_saved_" + this.state.assignment_id)
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (value) {
            localStorage.setItem(name + "_" + this.state.assignment_id, value)
        }
        else {
            localStorage.removeItem(name + "_" + this.state.assignment_id)
        }

        this.setState({
            [name]: value,
        });
    }

    readInFromLocalStorage() {
        customizable_options.forEach(variable => {
            if (localStorage.getItem(variable + "_" + this.state.assignment_id)) {
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
            assignment_id: this.props.assignmentId,
            loaded: true,
        })
    }

    componentDidUpdate() {
        this.readInFromLocalStorage();
    }

    render() {
        if (this.state.loaded) {
            return (
                <form>
                    <label>
                        <input name="send_incomplete_messages" type="checkbox" checked={this.state.send_incomplete_messages} onChange={this.handleInputChange} />
                        Send Messages to All Students Who Have Incomplete Peer Reviews At Due Date 1?:
                    </label>
                    <br></br>
                    {
                        this.state.custom_benchmarks && localStorage.getItem("custom_benchmarks_saved_" + this.state.assignment_id) ?
                            <button onClick={this.editingBenchmarks}>Edit</button>
                            :
                            null
                    }
                    <label>
                        <input name="custom_benchmarks" type="checkbox" checked={this.state.custom_benchmarks} onChange={this.handleInputChange} />
                        Custom Benchmarks For Grading Algorithm?:
                    </label>
                    <br></br>
                    <label>
                        <input name="penalizing_for_incompletes" type="checkbox" checked={this.state.penalizing_for_incompletes} onChange={this.handleInputChange} />
                        Penalize Students Weights For Incomplete Peer Reviews?:
                    </label>
                    <br></br>
                    {
                        this.state.penalizing_for_incompletes ?
                            <label>
                                <input name="penalizing_for_reassigned" type="checkbox" checked={this.state.penalizing_for_reassigned} onChange={this.handleInputChange} />
                                Penalize For Peer Reviews That Were Reassigned, But Not Completed?:
                            </label>
                            :
                            null
                    }
                </form>
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
import React, { Component } from 'react';
import Loader from 'react-loader-spinner'

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

class AlgorithmBenchmarks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            changed: false,
            value: null,
            loaded: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: Number(event.target.value),
            changed: true,
        });

        localStorage.setItem(this.props.placeholder + "_" + this.props.assignmentId, event.target.value)
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    componentDidMount() {
        if (localStorage.getItem(this.props.placeholder + "_" + this.props.assignmentId)) {
            this.setState({
                changed: true,
            })
        }

        if (!this.state.value) {
            this.setState({
                value: this.props.value,
                loaded: true,
            })
        }
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <input type="number" value={this.state.changed ? this.state.value : ""} onChange={this.handleChange} min={this.props.min ? this.props.min : null} max={this.props.max ? this.props.max : null} step={this.props.step ? this.props.step : null} placeholder={this.props.placeholder} />
                        </label>
                    </form>
                </div>
            );
        }
        else {
            return (
                <Loader type="TailSpin" color="black" height={80} width={80} />
            )
        }
    }
}
export default AlgorithmBenchmarks;
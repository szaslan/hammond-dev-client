import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../Assignments/Assignments.css';

class AlgorithmBenchmarks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            changed: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

componentDidMount() {
    if (!this.state.value) {
        this.setState({
            value: this.props.value,
        })
    }
}

    handleChange(event) {
        this.setState({
            value: Number(event.target.value),
            changed: true,
        });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <input type="number" value={this.state.changed?this.state.value:""} onChange={this.handleChange} min={this.props.min?this.props.min:null} max={this.props.max?this.props.max:null} step={this.props.step?this.props.step:null} placeholder={this.props.placeholder}/>
                    </label>
                </form>
            </div>
        );
    }
}
export default AlgorithmBenchmarks;
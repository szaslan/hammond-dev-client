import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import Loader from 'react-loader-spinner';

import './OtherError.css';

class OtherError extends Component {
    constructor(props) {
        super(props);

        this.state = {
            context: null,
            error: null,
            loaded: false,
            location: null,
            message: null,
        }


        this.errorMessageTitle = "400 - Bad Request: An Error Occurred"
    }

    componentDidMount() {
        //this.props.location.state.error will only exist if the error came from an SQL querry
        this.setState({
            context: this.props.location.state.context,
            error: this.props.location.state.error,
            loaded: true,
            location: this.props.location.state.location,
            message: this.props.location.state.message,
        })
    }

    render() {
        if (this.state.loaded) {
            return (
                <div className="error-message">
                    <Row className="error-message-title">
                        {this.errorMessageTitle}
                    </Row>
                    <Row className="error-message-body">
                        Message received from {this.state.location}: {this.state.error ? this.state.error.sql : this.state.message}
                    </Row>
                    <Row>
                        Context: {this.state.context}
                    </Row>
                </div>
            );
        }
        else {
            return (
                <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
            )
        }
    }
}

export default OtherError;
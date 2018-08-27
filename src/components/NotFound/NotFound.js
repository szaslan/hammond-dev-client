import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import Loader from 'react-loader-spinner';

import './NotFound.css';

class NotFound extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            location: null,
            message: null,
        }


        this.errorMessageTitle = "Oops, it looks like something went wrong"
    }

    componentDidMount() {
        this.setState({
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
                        Message received from {this.state.location}: {this.state.message}
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

export default NotFound;
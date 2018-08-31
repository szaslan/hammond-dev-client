import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import Loader from 'react-loader-spinner';

import './NotFound.css';

class NotFound extends Component {
    constructor(props) {
        super(props);

        this.state = {
            context: null,
            loaded: false,
            location: null,
            message: null,
        }
        this.errorMessageTitle = "404 - Not Found: Oops, it looks like something went wrong"
    }

    componentDidMount() {
        this.setState({
            context: this.props.location.state.context,
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
                    <Row>
                        {this.state.message}
                    </Row>
                    <br />
                    <br />
                    <br />
                    <Row className="error-message-body">
                        Location of the error: {this.state.location}
                    </Row>
                    <Row className="error-context">
                        Context: {this.state.context}
                    </Row>
                </div>
            );
        }

        return (
            <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default NotFound;

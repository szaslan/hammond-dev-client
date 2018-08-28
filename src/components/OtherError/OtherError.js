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
                    {
                        this.state.error ?
                            //SQL Error
                            <div className="sql-error">
                                <Row>
                                    <b>This was an SQL error</b>
                                </Row>
                                <Row>
                                    Error: {this.state.error.code}
                                </Row>
                                <Row>
                                    SQL Querry: {this.state.error.sql}
                                </Row>
                                <Row>
                                    SQL Message: {this.state.error.sqlMessage}
                                </Row>
                            </div>
                            :
                            //Canvas Error
                            <Row>
                                This was an error with Canvas: {this.state.message}
                            </Row>

                    }
                    <br></br>
                    <br></br>
                    <br></br>
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

export default OtherError;
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Row } from 'react-bootstrap';
import history from '../../history'
import Loader from 'react-loader-spinner';

import './UnauthorizedError.css';

class UnauthorizedError extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            location: null,
            message: null,
            timeUntilRedirect: null,
        }

        this.redirectToHomePage = this.redirectToHomePage.bind(this);

        this.errorMessageTitle = "401 - Unauthorized: Access is denied due to invalid credentials"
    }

    redirectToHomePage() {
        history.push("/login")
    }

    componentDidMount() {
        this.setState({
            loaded: true,
            location: this.props.location.state.location,
            message: this.props.location.state.message,
            timeUntilRedirect: 10,
        })

        setInterval(() => {
            this.setState(prevState => ({
                timeUntilRedirect: prevState.timeUntilRedirect - 1,
            }))
        },
            1000
        )
    }

    render() {
        if (this.state.loaded) {
            return (
                <div className="error-message">
                    {
                        this.state.timeUntilRedirect === 0 ?
                            this.redirectToHomePage()
                            :
                            null
                    }

                    <Row className="error-message-title">
                        {this.errorMessageTitle}
                    </Row>
                    <Row className="error-message-body">
                        Message received from {this.state.location}: {this.state.message}
                    </Row>
                    <Row className="redirect-message">
                        You will be redirected to the login page in {this.state.timeUntilRedirect} second{this.state.timeUntilRedirect === 1 ? "" : "s"} or
                        <Link className="immediate-redirection" to={{ pathname: "/login" }}>
                            click here
                        </Link>
                        to be redirected now
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

export default UnauthorizedError;
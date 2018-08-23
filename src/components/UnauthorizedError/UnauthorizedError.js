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
            message: null,
            time_until_redirect: null,
        }

        this.redirectToHomePage = this.redirectToHomePage.bind(this);

        this.error_message_title = "401 - Unauthorized: Access is denied due to invalid credentials"
    }

    redirectToHomePage() {
        history.push("/login")
    }

    componentDidMount() {
        this.setState({
            loaded: true,
            message: this.props.message,
            time_until_redirect: 10,
        })

        setInterval(() => {
            this.setState(prevState => ({
                time_until_redirect: prevState.time_until_redirect - 1,
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
                        this.state.time_until_redirect == 0 ?
                            this.redirectToHomePage()
                            :
                            null
                    }

                    <Row className="error-message-title">
                        {this.error_message_title}
                    </Row>
                    <Row className="error-message-body">
                        Message Received From Canvas: {this.state.message}
                    </Row>
                    <Row className="redirect-message">
                        You will be redirected to the login page in {this.state.time_until_redirect} second{this.state.time_until_redirect == 1 ? "" : "s"} or
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
import React, { Component } from 'react';
import './Landing.css';
import { Link, Redirect } from "react-router-dom";
import { Col, Row } from 'react-bootstrap';
import { Label, Container, Form, FormGroup, Input } from 'reactstrap';
import Flexbox from 'flexbox-react';
class Landing extends Component {
    render() {
        return (

            <div className="entire-screen" fluid>
                {/* <img className = "background-image" src = {require('./deering-interior-square.jpg')} /> */}
                <div className="screen-content">
                    <h1 className="welcome-message"><strong>Welcome to</strong></h1>
                    <h1 className="title-message"><strong>papr.</strong></h1>
                    <Flexbox justifyContent="center" className="flexbox-of-buttons">
                        <Link to="/login">
                            <button className="cool-button">Sign In</button>
                        </Link>
                        <Link to="/register">
                            <button className="cool-button">Register</button>
                        </Link>
                    </Flexbox>
                </div>
            </div>

        )
    }

}
export default Landing;
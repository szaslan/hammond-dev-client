import './JumbotronComp.css'
import React, { Component } from 'react';
import {Link } from "react-router-dom";
import { Container, Jumbotron } from 'reactstrap';
import { Row, Col } from 'react-bootstrap';

class JumbotronComp extends Component {
    constructor(props){
        super(props);

     this.signOut = this.signOut.bind(this);

    }

      signOut(){
        fetch('/logout', {
            credentials: 'include'
        })
        .then(response => console.log(response))
    }


    render() {
        return (
            <Jumbotron className="jumbo" fluid>
                <Container className="jumbo-container" fluid>
                    <Row className="jumbo-row" fluid>
                        <Col xs={11} className="col1" >
                            <Row className="row-title">
                                <h1 className="welcome">{this.props.secondaryTitle}</h1>
                            </Row>
                            <Row className="row-title">
                                <h1 className="name">{this.props.mainTitle}</h1>
                            </Row>
                        </Col>
                        <Col xs={1} className="col2">
                            <Link to="/logout">
                                <button className="pull-right signout-button" onClick={this.signOut}>Sign Out</button>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </Jumbotron>

        )
    }
}

export default JumbotronComp;

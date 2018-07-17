
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './CalendarComp.css';
import { Well } from 'react-bootstrap';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import DueDate from '../DueDate/DueDate';

class CalendarComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonPressed: false
        };
        this.handleClick1 = this.handleClick1.bind(this);
    }
    handleClick1() {
        this.setState(prevState => ({
            buttonPressed: !prevState.buttonPressed
        }));
    }
    render() {
        return (
            <div>
                <button onClick={this.handleClick1} >{this.props.name}</button>
                {
                    (this.state.buttonPressed ? 
                        <DueDate />
                    :
                    <div></div>
                    )
                }
            </div>
        )
    }
}
export default CalendarComp;
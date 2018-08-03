// import 'input-moment.less';
// import './app.less';
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './DueDate.css';

import { Well } from 'react-bootstrap';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
// import packageJson from '../../package.json';

class DueDate extends Component {
    
    state = {
        m: moment(),

    };

    handleChange = m => {
        this.setState({ m });
    };

    handleSave = () => {
        this.state.savePressed = true;
        console.log('saved', this.state.m.format('llll'));
        localStorage.setItem("calendarDate" + this.props.assignment_id + this.props.number, this.state.m.format('llll'));
    };


    render() {
        return (
            <div className="app">


                <form>
                    <div className="input">
                        {/* <input type="text" value={this.state.m.format('llll')} readOnly /> */}
                        <input type="text" value={this.state.m.format('llll')} readOnly />
                    </div>
                    <InputMoment
                        moment={this.state.m}
                        onChange={this.handleChange}
                        onSave={this.handleSave}
                        minStep={1} // default
                        hourStep={1} // default
                        prevMonthIcon="ion-ios-arrow-left" // default
                        nextMonthIcon="ion-ios-arrow-right" // default
                    />


                </form>



            </div>
        );
    }
}
export default DueDate;
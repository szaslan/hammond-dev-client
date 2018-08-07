// import 'input-moment.less';
// import './app.less';
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './DueDate.css';
import '../CalendarComp/CalendarComp.css';
import { Tooltip } from 'reactstrap';
import { Alert } from 'react-bootstrap';

var infoIcon = require('../InfoIcon.svg')

class DueDate extends Component {

    constructor(props) {
        super(props);

        this.state = {
            m: moment(),
            dueDate: '',
            dueDateDisplay: '',
            dueDateActual: '',
            tooltipOpen: false,
            buttonPressed: false,
            message: '',
        };
        this.handleClick1 = this.handleClick1.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggle = this.toggle.bind(this);
        this.isAcceptable = true;
        this.isAfter = true;
        this.handleDismiss = this.handleDismiss.bind(this);

    }
    handleDismiss() {
        this.isAcceptable = true;
        this.state.buttonPressed = true;
        this.isAfter = true;
        // localStorage.removeItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number);
    }
    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    handleChange = m => {
        /*this.setState({ dueDateDisplay: m.format('llll') });
        this.setState({ dueDateActual: m.format('l') + ", " + m.format('LTS') });
        var new_date = new Date(this.state.dueDateDisplay)
        var formatted = moment(new_date).format('llll')
        console.log("formatted: " + formatted)*/
        //this.setState({ dueDateDisplay: m.format('llll') }, () => {
            // localStorage.setItem(("calendarDate_" + this.props.assignment_id + "_" + this.props.number), this.state.dueDateActual);
            //localStorage.setItem(("calendarDate_" + this.props.assignment_id + "_" + this.props.number), this.state.dueDateDisplay);
        //});
        this.setState({ dueDateDisplay: m.format('llll') });
        this.setState({ dueDateActual: m.format('l') + ", " + m.format('LTS') });
        var formatted = m.format('llll');
        console.log("formatted: ", formatted);



    };
    handleClick1() {
        this.setState(prevState => ({
            buttonPressed: !prevState.buttonPressed
        }));
    }

    handleSave = () => {

        this.setState({ buttonPressed: false })
        // this.setState({dueDateDisplay: this.state.dueDate})

        localStorage.setItem(("calendarDate_" + this.props.assignment_id + "_" + this.props.number), this.state.dueDateDisplay);

        console.log('saved', this.state.dueDate);

        var actual_date = new Date(this.state.m.format('llll'));
        console.log("actual_date: ", actual_date);
        var d = new Date();
        console.log('STUFFFFFFFF', (actual_date.getTime() - d.getTime()));
        if ((actual_date.getTime() - d.getTime()) < 0) {
            this.isAcceptable = false;
            this.setState({ buttonPressed: true });
            localStorage.removeItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number);
            this.setState({ dueDateDisplay: "" });
        }
        else {
            this.isAcceptable = true;
            this.setState({ buttonPressed: false });
        }

        if (this.props.number == "2") {
            var date_1 = new Date(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_1"));
            if (date_1.getTime() > actual_date.getTime()) {
                this.isAfter = false;
                localStorage.removeItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number);
                this.setState({ dueDateDisplay: "" });
                this.setState({ buttonPressed: true });
            }
            else { 
                this.isAfter = true; 
                this.setState({ buttonPressed: false });
            }
        }
        else if (this.props.number == "3") {
            var date_2 = new Date(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_2"));
            if (date_2.getTime() > actual_date.getTime()) {
                this.isAfter = false;
                localStorage.removeItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number);
                this.setState({ dueDateDisplay: "" });
                this.setState({ buttonPressed: true });
            }
            else { 
                this.isAfter = true; 
                this.setState({ buttonPressed: false });
            }
        }
        else { 
            this.isAfter = true;
            this.setState({ buttonPressed: false });
        }

    };

    componentDidMount() {
        this.setState({
            message: this.props.message
        })

        if (localStorage.getItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number)) {
            var actual_date = new Date(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number));
            var formatted_date = moment(actual_date).format('llll');

            this.setState({ dueDateDisplay: formatted_date })
        }
    }


    render() {
        return (
            <div className="app">

                <p>
                    <button onClick={this.handleClick1} >{this.props.name}</button>
                    <span style={{ textDecoration: "underline", color: "blue" }} href="#" id={"TooltipExample" + this.props.number}>
                        <img src={infoIcon} width="20"/>
                    </span>
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipExample" + this.props.number} toggle={this.toggle}>
                        {this.state.message}

                    </Tooltip>
                    {this.state.dueDateDisplay}
                </p>


                {this.state.buttonPressed ?


                    (this.isAcceptable ?
                        (this.isAfter ?
                            <form>
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
                            :
                            <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                                <h2>Oops.</h2>
                                <h4>That date comes before one of the previous Due Dates.
                                    Please select a date that comes after all of the previous Due Dates.</h4>

                                {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                            </Alert>
                        )
                        :

                        <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                            <h2>Oops.</h2>
                            <h4>That date has already happened. Please select a date that has not happened.</h4>

                            {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                        </Alert>
                    )
                    :
                    null
                }



            </div>
        );
    }
}
export default DueDate;
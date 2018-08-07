// import 'input-moment.less';
// import './app.less';
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './DueDate.css';
import '../CalendarComp/CalendarComp.css';
import { Tooltip } from 'reactstrap';
import { Collapse, Button, CardBody, Card } from 'reactstrap';

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



    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    handleChange = m => {
        this.setState({ dueDateDisplay: m.format('llll') });
        this.setState({ dueDateActual: m.format('l') + ", " + m.format('LTS') });
        var new_date = new Date(this.state.dueDateDisplay)
        var formatted = moment(new_date).format('llll')
        console.log("formatted: " + formatted)
    };
    handleClick1() {
        this.setState(prevState => ({
            buttonPressed: !prevState.buttonPressed
        }));
    }

    handleSave = () => {
        this.setState({ buttonPressed: false })
        // this.setState({dueDateDisplay: this.state.dueDate})
        console.log('saved', this.state.dueDate);
        localStorage.setItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number, this.state.dueDateActual);
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
                    null
                }



            </div>
        );
    }
}
export default DueDate;
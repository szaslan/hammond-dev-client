import React, { Component } from 'react';
import Datetime from 'react-datetime';
import './NewDueDate.css';
import moment from 'moment';
import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';
import Flexbox from 'flexbox-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const format = 'h:mm a';
const now = moment().hour(0).minute(0);

class NewDueDate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            calValue: (localStorage.getItem("date" + this.props.assignmentId + "_" + this.props.number) ?
                localStorage.getItem("date" + this.props.assignmentId + "_" + this.props.number)
                :
                now),
            timeValue: (localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number) ?
                localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number)
                :
                now),
            m: moment(),
            isSaved: false,
            modal: false,
            // isInPast: false,
            // isBeforeDates: false,
        };
        // this.checkTime = this.checkTime.bind(this);
        this.toggle = this.toggle.bind(this);
        this.checkDate = this.checkDate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.num = Number(this.props.number) - 1;
        this.isValidTime = true;
        this.isInPast = false;
        this.isBeforeDates = false;
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
            // isInPast: false,
            // isBeforeDates: false,
        });
        //localStorage.removeItem("time" + this.props.assignmentId + "_" + this.props.number);
        localStorage.removeItem("dateTime" + this.props.assignmentId + "_" + this.props.number);
        
        // this.state.isInPast = false;
        // this.state.isBeforeDates = false;
    }

    onChange(value) {
        // console.log("value", value);
        this.setState({ timeValue: value });
    }

    handleChange(value) {
        this.setState({ calValue: value });
    }

    handleSubmit(event) {
        event.preventDefault();
        var concatDateTime = (this.state.calValue).format('ddd MMM DD YYYY') + " " + (this.state.timeValue).format('HH:mm:ss') + " GMT-0500";
        //localStorage.setItem("time" + this.props.assignmentId + "_" + this.props.number, this.state.timeValue);
        //localStorage.setItem("date" + this.props.assignmentId + "_" + this.props.number, this.state.calValue);
        localStorage.setItem("dateTime" + this.props.assignmentId + "_" + this.props.number, concatDateTime);
        this.setState({ isSaved: true });

        // var currentTime = Datetime.moment(moment().format('MM/DD/YYYY h:mma'));
        var currentTime = Datetime.moment();
        localStorage.setItem("currentTime", currentTime);
        console.log("current time", currentTime);

        var endTime = Datetime.moment(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.props.number));
        localStorage.setItem("endTime", endTime);
        console.log("endTime", endTime);

        if (endTime.isBefore(currentTime)) {
            console.log("ONEeeee");
            this.isValidTime = false;
            //this.state.isInPast = true;
            this.isInPast= true ;
            console.log(this.state.isInPast);
        }
        else {
            if (this.num == 0) {
                console.log("TWOOOO");
                this.isValidTime = true;
            }
            else {
                console.log("THREEE");
                var beginningTime = Datetime.moment(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.num));
                console.log("beginningTime", beginningTime);
                this.isValidTime = beginningTime.isBefore(endTime);
                //this.state.isBeforeDates = endTime.isBefore(beginningTime);
                this.isBeforeDates= endTime.isBefore(beginningTime);
            }
        }



        if (!this.isValidTime) {
            this.toggle();
            this.setState({
                isInPast: false,
                isBeforeDates: false,
            });
        }
    }

    checkDate(current) {
        if (this.num == 0) {
            var yesterday = Datetime.moment().subtract(1, 'day');
            return current.isAfter(yesterday);
        }
        else {

            var lowerBoundDate = Datetime.moment(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.num)).subtract(1, 'day');
            // console.log("lowerbound", lowerBoundDate);
            return current.isAfter(lowerBoundDate);
        }

    }

    render() {
        return (
            <div className={"dateTime " +
                (this.props.isGray ?
                    "grayOut"
                    :
                    null)}>
                <form onSubmit={this.handleSubmit} className="dateTimeForm">
                    <Datetime inputProps={{
                        placeholder: (localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.props.number) ?
                            (moment(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.props.number))).format('MM/DD/YYYY')
                            :
                            "Select a Date"),
                        disabled: true
                    }} dateFormat="MM/DD/YYYY" timeFormat={false} onChange={this.handleChange} isValidDate={this.checkDate} />


                    <Flexbox justifyContent="space-between">
                        <TimePicker
                            showSecond={false}
                            // defaultValue={(localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number) ?
                            //     moment(localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number))
                            //     :
                            //     now)}
                            className="timePicker"
                            onChange={this.onChange}
                            format={format}
                            use12Hours
                            inputReadOnly
                            placeholder={(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.props.number) ?
                                (moment(localStorage.getItem("dateTime" + this.props.assignmentId + "_" + this.props.number))).format('h:mm a')
                                :
                                "Select a Time")}
                        />
                        <input type="submit" value="Submit" className="dateTimeSubmit" />
                    </Flexbox>

                    <Modal isOpen={this.state.modal} /*toggle={this.toggle}*/ className="invalidModal">
                        <ModalHeader toggle={this.toggle}>Invalid Time Selected</ModalHeader>
                        {this.isInPast ?
                            <ModalBody>
                                Looks like you chose a date and time that has already occured. Please choose one that has not.
                            </ModalBody>
                            :
                            (this.isBeforeDates ?
                                <ModalBody>
                                    Looks like you chose a date and time that occurs before Due Date {this.num} for this assignment. 
                                    Please choose one that does not.
                                </ModalBody>
                                :
                                this.toggle
                            )
                        }


                    </Modal>

                </form>



            </div>
        )
    }

};

export default NewDueDate;
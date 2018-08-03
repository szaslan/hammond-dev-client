// import 'input-moment.less';
// import './app.less';
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './DueDate.css';
import '../CalendarComp/CalendarComp.css';
import { Tooltip } from 'reactstrap';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
// import packageJson from '../../package.json';

class DueDate extends Component {

    constructor(props){
        super(props);
    
        this.state = {
            m: moment(),
            dueDate: '',
            dueDateDisplay: '',
            tooltipOpen: false,
            buttonPressed: false,
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
        this.setState({dueDateDisplay: m.format('llll') });
        console.log(this.state.m.format('llll'))
    };
    handleClick1() {
        this.setState(prevState => ({
            buttonPressed: !prevState.buttonPressed
        }));
    }

    handleSave = () => {
        this.setState({buttonPressed: false})
        // this.setState({dueDateDisplay: this.state.dueDate})
        console.log('saved', this.state.dueDate);
        localStorage.setItem("calendarDate" + this.props.assignment_id + this.props.number, this.state.dueDateDisplay);
    };

    componentDidMount(){
        this.setState({dueDateDisplay: localStorage.getItem("calendarDate" + this.props.assignment_id + this.props.number)})
    }


    render() {
        return (
            <div className="app">

                <p>
                    <span style={{ textDecoration: "underline", color: "blue" }} href="#" id={"TooltipExample"+this.props.number}>
                        <button onClick={this.handleClick1} >{this.props.name}</button>
                    </span>
                    <Tooltip placement="right" delay={{show:"1200"}} isOpen={this.state.tooltipOpen} target={"TooltipExample"+this.props.number} toggle={this.toggle}>
                        Click to set a due date
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

// import moment from 'moment';
// import React, { Component } from 'react';
// import InputMoment from 'input-moment';
// import './CalendarComp.css';
// import { Button, Tooltip } from 'reactstrap';
// import DueDate from '../DueDate/DueDate';



// class CalendarComp extends Component {
//     constructor(props) {
//         super(props);
//         this.toggle = this.toggle.bind(this);
//         this.state = {
//             tooltipOpen: false,
//             buttonPressed: false
//         };
//         this.handleClick1 = this.handleClick1.bind(this);
//     }
//     handleClick1() {
//         this.setState(prevState => ({
//             buttonPressed: !prevState.buttonPressed
//         }));
//     }
//     toggle() {
//         this.setState({
//             tooltipOpen: !this.state.tooltipOpen
//         })
//     }

//     componentDidMount(){
//         this.setState({dueDate: localStorage.getItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number)})
//     }



//     render() {
//         return (

//             <div>
//                 <p>
//                     <span style={{ textDecoration: "underline", color: "blue" }} href="#" id={"TooltipExample"+this.props.number}>
//                         <button onClick={this.handleClick1} >{this.props.name}</button>
//                     </span>
//                     <Tooltip placement="right" delay={{show:"1200"}} isOpen={this.state.tooltipOpen} target={"TooltipExample"+this.props.number} toggle={this.toggle}>
//                         Click to set a due date
//                     </Tooltip>
//                     {/* {localStorage.getItem("calendarDate" + this.props.assignment_id + this.props.number)} */}
//                     {/* {this.state.dueDate} */}
//                     {(localStorage.getItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number) ?
//                     localStorage.getItem("calendarDate_" + this.props.assignment_id + "_" + this.props.number)
//                     :
//                     " "
//                     )}
//                 </p>
//                 {
//                     (this.state.buttonPressed ?
//                         <DueDate
//                             assignment_id={this.props.assignment_id}
//                             number={this.props.number} />
//                         :
//                         <div></div>
//                     )
//                 }
//             </div>
//         )
//     }
// }
// export default CalendarComp;
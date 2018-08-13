import './CalendarComp.css';
import React, { Component } from 'react';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import { Container, Jumbotron, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';

class CalendarComp extends Component {
    render() {
        return (
            <div>
            <JumbotronComp mainTitle="Course Name" tabs/>
            
                       
            </div>

        )
    }
}

export default CalendarComp;
import './CourseInfoComp.css';
import React, { Component } from 'react';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import { Container, Jumbotron, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';

class CourseInfoComp extends Component {
    render() {
        return (
            <div>
            <JumbotronComp mainTitle="Course Name" tabs/>
            
                       
            </div>

        )
    }
}

export default CourseInfoComp;
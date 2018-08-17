import React, { Component } from 'react';

import JumbotronComp from '../JumbotronComp/JumbotronComp';

import './CourseInfoComp.css';

class CourseInfoComp extends Component {
    render() {
        return (
            <div>
                <JumbotronComp mainTitle="Course Name" tabs />
            </div>
        )
    }
}

export default CourseInfoComp;
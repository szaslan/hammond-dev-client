import React, { Component } from 'react';
import { Router, Route } from "react-router-dom";
import history from './history'

import Courses from './components/Courses/Courses';
import CourseInfo from './components/CourseInfo/CourseInfo';
import CourseStudents from './components/CourseStudents/CourseStudents';
import Landing from './components/Landing/Landing';
import NotFound from './components/NotFound/NotFound';
import OtherError from './components/OtherError/OtherError';
import StudentInfo from './components/StudentInfo/StudentInfo';
import UnauthorizedError from './components/UnauthorizedError/UnauthorizedError';
import UserLogin from './components/UserLogin/UserLogin';
import UserRegistration from './components/UserRegistration/UserRegistration';

import './App.css';

function masterSetLocalStorage(varName, value){
    localStorage.setItem(varName, value);
    localStorage.setItem("pageSaved?", false);
}

class App extends Component {
	constructor(props) {
        super(props);

        localStorage.setItem("pageSaved?", true);
    }

	render() {
		return (
			<Router history={history}>
				<div className="App">

					{/*Landing Page*/}
					<Route path="/" exact component={Landing} />

					<Route path="/unauthorized" exact component={UnauthorizedError} />
					<Route path="/notfound" exact component={NotFound} />
					<Route path="/error" exact component={OtherError} />

					{/* To login*/}
					<Route path="/(login|logout)" exact component={UserLogin} />
					<Route path="/register" exact component={UserRegistration} />

					{/*List of Courses*/}
					<Route path="/courses" exact component={Courses} />
					<Route path="/courses/:course_id" exact component={CourseInfo} />

					{/*Show assignments and students*/}
					{/* <Route path="/courses/:course_id/assignments" component={Assignments} /> */}
					{/* <Route path="/courses/:course_id/assignments/:assignment_id" exact component={AssignmentInfo} /> */}

					{/* <Route path="/courses/:course_id/:course_name/students" component={CourseStudents} /> */}
					<Route path="/courses/:course_id/students" component={CourseStudents} />
					{/* <Route path="/courses/:course_id/:course_name/students/:student_id" exact component={StudentInfo} /> */}
					<Route path="/courses/:course_id/students/:student_id" exact component={StudentInfo} />
				</div>
			</Router>

		);
	}
}

export default App;
export {masterSetLocalStorage};

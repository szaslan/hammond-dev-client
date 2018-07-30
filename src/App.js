import React, { Component } from 'react';
import './App.css';
import Students from './components/students/students';
import UserLogin from './components/UserLogin/UserLogin';
import Courses from './components/Courses/Courses';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Assignments from './components/Assignments/Assignments';
import { Router, Route, Switch, Redirect} from "react-router-dom";
import CourseStudents from './components/CourseStudents/CourseStudents';
import AssignmentInfo from './components/AssignmentInfo/AssignmentInfo';
import UserRegistration from './components/UserRegistration/UserRegistration';
import history from './history'
import Landing from './components/Landing/Landing';
import StudentInfo from './components/StudentInfo/StudentInfo';
import NotFound from './components/NotFound/NotFound';
import AuthenticatedComponent from './components/AuthenticatedComponent/AuthenticatedComponent';


class App extends Component {

  
  render() {
    return (
      <Router history={history}>
        <div className="App"> 
          {/*Landing Page*/} 
          <Route path="/" exact component={Landing} />

          {/* To login*/}
          <Route path="/(login|logout)" exact component={UserLogin}/>
          <Route path="/register" exact component={UserRegistration} />

          {/*List of Courses*/}
          <Route path="/courses"  exact component={Courses}/>
          <Route path="/courses/:course_id"  exact component={CourseInfo} />

          {/*Show assignments and students*/}

          {/* <Route path="/courses/:course_id/assignments"  component={Assignments} /> */}
          <Route path="/courses/:course_id/:assignment_name/assignments"  component={Assignments} />
          
          <Route path="/courses/:course_id/:assignment_name/assignments/:assignment_id" exact component={AssignmentInfo} />

          <Route path="/courses/:course_id/:assignment_name/students"  component={CourseStudents}/>

          <Route path="/courses/:course_id/:assignment_name/students/:student_id" exact component={StudentInfo} />

          {/* <Route component={NotFound} exact/> */}

        </div>
      </Router>

    );
  }
}

export default App;

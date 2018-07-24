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
import createBrowserHistory from 'history/createBrowserHistory'
import Landing from './components/Landing/Landing';
import AuthenticatedComponent from './components/AuthenticatedComponent/AuthenticatedComponent';

const history = createBrowserHistory();

class App extends Component {

  
  render() {
    return (
      <Router history={history}>
        <Switch>
        <div className="App"> 
          {/*Landing Page*/} 
          <Route path="/" exact component={Landing} />

          {/* To login*/}
          <Route path="/(login|logout)" exact component={UserLogin}/>
          <Route path="/register" exact component={UserRegistration} />

          {/*Need signup page*/}

          <Route path="/user" exact component={Students}/>

          {/*List of Courses*/}
          <Route path="/courses"  exact component={Courses}/>
          <Route path="/courses/:course_id"  exact component={CourseInfo} />

          {/*Show assignments and students*/}

          {/* <Route path="/courses/:course_id/assignments"  component={Assignments} /> */}
          <Route path="/courses/:course_id/:assignment_name" component={Assignments} />
          
          <Route path="/courses/:course_id/:assignment_name/:assignment_id" exact component={AssignmentInfo} />

          <Route path="/courses/:course_id/students" exact component={CourseStudents}/>

        </div>
        </Switch>
      </Router>

    );
  }
}

export default App;

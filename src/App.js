import React, { Component } from 'react';
import './App.css';
import Students from './components/students/students';
import UserLogin from './components/UserLogin/UserLogin';
import Courses from './components/Courses/Courses';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Assignments from './components/Assignments/Assignments';
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CourseStudents from './components/CourseStudents/CourseStudents';
import AssignmentInfo from './components/AssignmentInfo/AssignmentInfo';
import UserRegistration from './components/UserRegistration/UserRegistration';

class App extends Component {


  
  render() {
    return (
      <Router>
        <Switch>
        <div className="App">          
          {/* To login*/}
          <Route path="/" exact component={UserLogin}/>
          <Route path="/register" exact component={UserRegistration} />

          {/*Need signup page*/}

          <Route path="/user" exact component={Students}/>

          {/*List of Courses*/}
          <Route path="/courses"  exact component={Courses}/>
          <Route path="/courses/:course_id"  exact component={CourseInfo} />

          {/*Show assignments and students*/}
          <Route path="/courses/:course_id/assignments"  component={Assignments} />
          <Route path="/courses/:course_id/assignments/:assignment_id" exact component={AssignmentInfo} />


          <Route path="/courses/:course_id/students" exact component={CourseStudents}/>
        </div>
        </Switch>
      </Router>

    );
  }
}

export default App;

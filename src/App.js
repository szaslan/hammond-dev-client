import React, { Component } from 'react';
import './App.css';
import Students from './components/students/students';
import UserLogin from './components/UserLogin/UserLogin';
import Courses from './components/Courses/Courses';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Assignments from './components/Assignments/Assignments';
import { BrowserRouter as Router, Route} from "react-router-dom";
import CourseStudents from './components/CourseStudents/CourseStudents';

class App extends Component {


  
  render() {
    return (
      <Router>
        <div className="App">          
          {/* To login*/}
          <Route path="/" exact component={UserLogin}/>

          {/*Need signup page*/}

          <Route path="/students" exact component={Students}/>

          {/*List of Courses*/}
          <Route path="/courses"  exact component={Courses}/>
          <Route path="/courses/:course_id"  exact component={CourseInfo} />

          {/*Show assignments and students*/}
          <Route path="/courses/:course_id/assignments" exact component={Assignments}/>
          <Route path="/courses/:course_id/students" exact component={CourseStudents}/>
        </div>
      </Router>

    );
  }
}

export default App;

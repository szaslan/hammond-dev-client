import React, { Component } from 'react';
import './App.css';
import Students from './components/students/students';
import UserLogin from './components/UserLogin/UserLogin';
import { BrowserRouter as Router} from "react-router-dom";
import { Route } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">          
          <Route path="/" exact component={UserLogin}/>

          <Route path="/students" exact component={Students}/>
          


        </div>
      </Router>

    );
  }
}

export default App;

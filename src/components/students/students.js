import React, { Component } from 'react';
import './students.css';

class Students extends Component {

    constructor(){
        super();
        this.state = {
            showComponent: false,
            students: []
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
        fetch('/api/students').then(res => res.json())
        .then(students => this.setState({students}, () => console.log('Students fetched....', students )));
    }

    handleClick(){
        this.setState({showComponent: true});
    }

        
       
  render() {
    return (
      <div className="app">
          <h2>Students</h2>

          <button onClick = {this.handleClick}>
            Find students!
          </button>
          {
              this.state.showComponent ? 
        <ul className="studentList">
            {this.state.students.map(students =>
                <li key={students.id}>{students.last_name}</li>)}
        </ul> 
        :
        null
          }

        
      </div>
    );
  }
}

export default Students;

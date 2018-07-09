import React, { Component } from 'react';
import '../../styles/UserLogin/UserLogin.css';
import { Link } from "react-router-dom";


class UserLogin extends Component {
    constructor(props, context) {
        super(props, context);
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
          value: '',
          loggedIn: false,
          username: '',
          password: ''

        };
      }

      getValidationState() {
        const length = this.state.value.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
      }
    
      handleChange(e) {
        this.setState({username: e.target.username });
        this.setState({password: e.target.password});
      }

      handleSubmit(e){
        e.preventDefault();

        if (this.state.username !== '' && this.state.password !== ''){
          
          this.setState({loggedIn: true});
        }
      }

      componentDidMount(){
        console.log("correct");
      }
    
  render() {

    return (

      <div style={{maxWidth: 100}}>

      <form action="/login" method="GET">

        <input type="text" placeholder="username" value={this.state.username} onChange={this.handleChange} name="username"/>
        <input type="password" placeholder="password" value={this.state.password} onChange={this.handleChange} name="password"/>
        <input type="submit" value="Submit" />
      </form>

      <Link to="/register">
      <div>register</div>
      </Link>
      
      </div>

    );
  }
}

export default UserLogin;

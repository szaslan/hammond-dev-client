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

      


    
  render() {

    return (

      <div style={{maxWidth: 100}}>

      <form onSubmit={this.handleSubmit}>

        <input type="text" placeholder="username" value={this.state.username} onChange={this.handleChange}/>
        <input type="password" placeholder="password" value={this.state.password} onChange={this.handleChange}/>

            {this.state.loggedIn ? (<Link to="/students" >
            <input type="submit" value="Submit" />
            </Link>)
            :
            (<Link to="/" >
            <input type="submit" value="Submit" />
            </Link>)
          }
            
  
      </form>

      
      </div>

    );
  }
}

export default UserLogin;

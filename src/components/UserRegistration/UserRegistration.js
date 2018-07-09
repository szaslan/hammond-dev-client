import React, { Component } from 'react';
import './UserRegistration.css';


class UserRegistration extends Component {
    constructor(props, context) {
        super(props, context); 

        this.state = {
    
          email: '',
          password: '',
          success: false,
          errors: {},
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
      }


      handleUsername(e){
        e.preventDefault();
        this.setState({email: e.target.value});
      }

      handlePassword(e){
        e.preventDefault();
        this.setState({password: e.target.value});
      }


      handleSubmit(){
        fetch('/register', {method: "POST"})
        .catch(error => console.log(error));
      
    }
    
  render(){

    return (

      <div>
      {/* <form action="/register" method="post"> */}
        <form className="register-form" action="/register" method="POST" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="First Name"  name="first_name" className="register-input"/>
          <input type="text" placeholder="Last Name" name="last_name"className="register-input" />
          <input type="text" placeholder="Email" name="email" className="register-input" value={this.state.email} onChange={this.handleUsername}/>
          <input type="password" placeholder="password" name="password" className="register-input" value={this.state.password} onChange={this.handlePassword}/>
          <input type="password" placeholder="Password Match"  className="register-input" name="passwordMatch"/>
          <input type="submit"  className="register-input"/>
        </form>

        {this.state.success ? 
          <div>Registered!</div>
        :
          <div>Error</div>
        }

      </div>

    );
  }
}

export default UserRegistration;

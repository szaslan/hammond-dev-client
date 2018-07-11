import React, { Component } from 'react';
import './UserRegistration.css';


class UserRegistration extends Component {
    constructor(props, context) {
        super(props, context); 

        this.state = {

          firstName: '',
          lastName: '',
          email: '',
          password: '',
          passwordMatch: '',
          success: false,
          errors: {},
          msg: '',
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
      }


      handleChange(e){
        this.setState({[e.target.name]: e.target.value});
      }


      handleSubmit(event){
        event.preventDefault();

        var data = {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          password: this.state.password,
        }
        console.log(data);



        fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'},
          body: JSON.stringify(data)
          })
          .then(function(res){
            if (res.status > 400){
              throw new Error("Bad response from server")
            }
          })
          .then(function(data){
            if( data == "success"){
              this.setState({msg: "Registration successful!"})
            }
          })
        .catch(error => console.log(error));
      
    }
    
  render(){

    return (

      <div>
      {/* <form action="/register" method="post"> */}
        <form className="register-form" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="First Name"  name="firstName" className="register-input"  onChange={this.handleChange}/>
          <input type="text" placeholder="Last Name" name="lastName"className="register-input"   onChange={this.handleChange}/>
          <input type="text" placeholder="Email" name="email" className="register-input"  onChange={this.handleChange}/>
          <input type="password" placeholder="password" name="password" className="register-input" onChange={this.handleChange}/>
          <input type="password" placeholder="Password Match"  className="register-input" name="passwordMatch" onChange={this.handleChange}/>
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

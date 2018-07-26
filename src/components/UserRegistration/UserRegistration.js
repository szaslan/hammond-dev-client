import React, { Component } from 'react';
import './UserRegistration.css';
import { BrowserHistory, Redirect } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { Form, FormGroup, Input } from 'reactstrap';
import {Well} from 'react-bootstrap';

const history = createBrowserHistory();


class UserRegistration extends Component {
  constructor(props, ) {
    super(props);

    this.state = {

      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password2: '',
      errors: [],
      msg: '',
      success: false,
      reDirect: false,
      emailExists: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }


  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }


  handleSubmit(event) {
    event.preventDefault();

    const errors = this.state.errors;

    var data = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    }
    // console.log(data);

    let fetchError = this;

    fetch('/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      // .then(function(res){
      //     if (res.status > 400){
      //     throw new Error("Bad response from server")
      //   }
      //   else if (res == "success"){
      //     this.setState({msg: res});
      //     console.log(this.state.msg)
      //   }
      // })


      // .then(res => this.CheckStatus(res))

      /*THIS IS THE PROBLEM,
      ITS TRYING TO PARSE AN EMPTY ARRAY */

      .then(function (response) {
        console.log(response)
        if (response.status == 200) {
          fetchError.setState({ errors: [], reDirect: true })
          fetchError.setState({ success: true })

          throw new Error("breaking promise chain early");
        }
        else if (response.status == 404){
          fetchError.setState({emailExists: true})
        }
        response.json().then(function (data) {
          console.log(data)
          console.log("data length: " + data.length)
          if (data.length > 0)
            fetchError.setState({ errors: data })
        })
      })
      // .then(res => this.setState({errors: res}))
      .catch(error => console.log(error))



    // this.MapErrors(this.state.errors);


  }

  render() {

    const errors = this.state.errors;


    return (
      <div className="entire-screen">
        <div className="register-group">
          <h1 className="welcome-message"><strong>Sign Up</strong></h1>
          <Form className="register-form" onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input type="text" placeholder="First Name" name="firstName" className="register-input" onChange={this.handleChange} />
              <Input type="text" placeholder="Last Name" name="lastName" className="register-input" onChange={this.handleChange} />
            </FormGroup>
            <FormGroup>
              <Input type="text" placeholder="Email" name="email" className="register-input" onChange={this.handleChange} />
              <Input type="password" placeholder="Password" name="password" className="register-input" onChange={this.handleChange} />
              <Input type="password" placeholder="Re-enter your password" className="register-input" name="password2" onChange={this.handleChange} />
            </FormGroup>
            <button className="new-button">Submit</button>
            <Well>
            {errors.length > 0 ? <ul className="errors">
              {
                (errors.map(errors =>
                  <li>{errors.msg}</li>))}
            </ul>
              :
              null
            }
            {this.state.emailExists ? <div>"Sorry that email already exists"</div> : null}

            {this.state.reDirect ?
              <Redirect to='/courses' />
              :
              null
            }
            </Well>
          </Form>
        </div>
      </div>

    );
  }
}

export default UserRegistration;

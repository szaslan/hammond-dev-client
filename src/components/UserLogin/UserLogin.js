import React, { Component } from 'react';
import './UserLogin.css';
import { Link, Redirect } from "react-router-dom";
import { Col, Row } from 'react-bootstrap';
import { Label, Container, Form, FormGroup, Input } from 'reactstrap';
import Flexbox from 'flexbox-react';

class UserLogin extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);


    this.state = {
      value: '',
      loggedIn: false,
      email: '',
      password: '',
      url: '/login',
      errors: '',
      reDirect: false,

    };
  }


  componentDidMount() {
    console.log("correct");
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  handleSubmit(event){
    event.preventDefault();

    console.log('CLICKED')

    var data = {
      email: this.state.email,
      password: this.state.password,
    }

    let fetchError = this;

    fetch('/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(function(response) {
        console.log(response)
        if (response.status == 200) {
          console.log('200 STATUS')
          fetchError.setState({ reDirect: true })
        }
        else if (response.status == 401 || response.status == 400) {
          fetchError.setState({ errors: "Invalid username or password" })
        }
      })

      .catch(error => console.log(error))
  }

  render() {
    const errors = this.state.errors;
    return (
      // <Row className="screen" >

      //   <Col className="right-side-col" fluid>
      //     <div className="login-group">
      //       <h1 className="please-signin">Please Sign In</h1>
      //       <Form>
      //         <FormGroup>
      //           <Input type="email" name="email" id="exampleEmail" placeholder="Email address" onChange={this.handleChange} name="email" />
      //         </FormGroup>
      //         <FormGroup>
      //           <Input type="password" name="password" id="examplePassword" placeholder="Password" onChange={this.handleChange} name="password" />
      //         </FormGroup>
      //         {/*<button className="submit-button">Submit</button>*/}
      //         <button type="submit" value="Submit" className="submit-button" onClick={this.handleSubmit} >Submit</button>
      //         <Link to="/register">
      //           <button className="create-account">Create an Account</button>
      //         </Link>
      //         {errors.length > 0 ?
      //           <ul>
      //             {errors.map(error => <li>{error.msg}</li>)}
      //           </ul>
      //           :
      //           <Redirect to={this.state.url} />
      //         }

      //       </Form>

      //     </div>
      //   </Col>
      // </Row>
      <div className="entire-screen">
        <div className="login-group"> 
          <h1 className="welcome-message"><strong>Sign In</strong></h1>
          <Form>
            <FormGroup>
              <Input type="email" name="email" id="exampleEmail" placeholder="Email address" onChange={this.handleChange} name="email" />
            </FormGroup>
            <FormGroup>
              <Input type="password" name="password" id="examplePassword" placeholder="Password" onChange={this.handleChange} name="password" />
            </FormGroup>
            <Flexbox className="flexbox-login">
              <button type="submit" value="Submit" className="new-button" onClick={this.handleSubmit} >Submit</button>
              <Link to="/register">
              <button className="new-button">Register</button>
              </Link>
            </Flexbox>
            {errors ?
              <ul className="errors">{errors}</ul>
                :
                null
            }
            {this.state.reDirect ? <Redirect to="/courses" /> : null}
          </Form>
        </div>
      </div>

    );
  }
}

export default UserLogin;
 
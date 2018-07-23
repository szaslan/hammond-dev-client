import React, { Component } from 'react';
import './UserLogin.css';
import { Link, Redirect } from "react-router-dom";
import { Col, Row } from 'react-bootstrap';
import { Label, Container, Form, FormGroup, Input } from 'reactstrap';


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


      componentDidMount(){
        console.log("correct");
      }

      handleChange(e){
        this.setState({[e.target.name]: e.target.value});
      }

      handleSubmit(event){
        event.preventDefault();

        const errors = this.state.errors;

        var data = {
          email: this.state.email,
          password: this.state.password,
        }

        let fetchError = this;

      fetch('/login', {
        method: 'POST',
        redirect: 'follow',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify(data)
        })
        .then(function(response){
          console.log(response)
          if (response.status == 200){
            fetchError.setState({reDirect: true})
            // fetchError.setState({errors: ""});
            fetchError.setState({url: "/courses"})
          }
          else if(response.status == 400){
            fetchError.setState({errors: "Invalid username or password"})
          }
          })

        .catch(error => console.log(error))


      }
    
      
      
    
  render() {
    const errors = this.state.errors;
    return (

                  <Row className="screen" >

                  <Col className="right-side-col" fluid>
                      <div className="login-group">
                          <h1 className="please-signin">Please Sign In</h1>
                          <Form>
                              <FormGroup>
                                  <Input type="email" name="email" id="exampleEmail" placeholder="Email address"  onChange={this.handleChange} name="email"/>
                              </FormGroup>
                              <FormGroup>
                                  <Input type="password" name="password" id="examplePassword" placeholder="Password"  onChange={this.handleChange} name="password" />
                              </FormGroup>
                              {/*<button className="submit-button">Submit</button>*/}
                              <button type="submit" value="Submit" className="submit-button" onClick={this.handleSubmit} >Submit</button>
                              <Link to="/register">
                                <button className="create-account">Create an Account</button>
                              </Link>
                              
                              {errors ?
                                <div>{errors}</div>
                                  :
                                  null
                              }
                              {(this.state.reDirect ? <Redirect to="/courses"/> : null)}   
                            
                          </Form>
  
                      </div>
                  </Col>
              </Row>

    );
  }
}

export default UserLogin;

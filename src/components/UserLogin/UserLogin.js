import React, { Component } from 'react';
import './UserLogin.css';
import { Link } from "react-router-dom";
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

      // <div style={{maxWidth: 100}}>

      // <form action="/login" method="GET">

      //   <input type="text" placeholder="username" value={this.state.username} onChange={this.handleChange} name="username"/>
      //   <input type="password" placeholder="password" value={this.state.password} onChange={this.handleChange} name="password"/>
      //   <input type="submit" value="Submit" />
      // </form>

      // <Link to="/register">
      // <div>register</div>
      // </Link>
      
      // </div>
                  <Row className="screen" >

                  <Col className="right-side-col" fluid>
                      <div className="login-group">
                          <h1 className="please-signin">Please Sign In</h1>
                          <Form>
                              <FormGroup>
                                  <Input type="email" name="email" id="exampleEmail" placeholder="Email address" value={this.state.username} onChange={this.handleChange} name="username"/>
                              </FormGroup>
                              <FormGroup>
                                  <Input type="password" name="password" id="examplePassword" placeholder="Password" value={this.state.password} onChange={this.handleChange} name="password" />
                              </FormGroup>
                              {/*<button className="submit-button">Submit</button>*/}
                              <Link to="/user">
                                  <button className="submit-button">
                                      Submit</button>
                              </Link>
                              <Link to="/register">
                                <button className="create-account">Create an Account</button>
                              </Link>
                          </Form>
  
                      </div>
                  </Col>
              </Row>

    );
  }
}

export default UserLogin;

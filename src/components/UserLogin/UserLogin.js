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
          errors: [],

        };
      }

      getValidationState() {
        const length = this.state.value.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify(data)
        })
        .then(function(response){
          console.log(response)
          if (response.status == 200){
            fetchError.setState({url: "/courses"})
          }
          else if(response.status == 400){
            fetchError.setState({url: ''})
          }
          else if (response.status == 300){
            response.json().then(function(data){
              fetchError.setState({errors: data})
              console.log(fetchError.state.errors)
            })
          }
          //   response.json().then(function(data){
          //     fetchError.setState({url: data.url})
          //   })
          // }


          // if (response.status == 200){
          //   fetchError.setState({errors: [], reDirectTo: '/courses'})
          //   fetchError.setState({success: true})
            
          //   throw new Error("breaking promise chain early");
          })
        //   response.json().then(function(data){
        //     console.log(data)
        
        //     console.log("data length: " + data.length)
        //     if (data.length > 0)
        //       fetchError.setState({errors: data})
        //   })
        // })
        .catch(error => console.log(error))
      }
      
      
    
  render() {
    const errors = this.state.errors;
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
                              {errors.length > 0 ?
                              <ul>
                                {errors.map(error => <li>{error.msg}</li>)}
                              </ul>
                                  :
                                  <Redirect to={this.state.url} />
                              }   
                              
                          </Form>
  
                      </div>
                  </Col>
              </Row>

    );
  }
}

export default UserLogin;

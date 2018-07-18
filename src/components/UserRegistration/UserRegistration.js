import React, { Component } from 'react';
import './UserRegistration.css';
import { BrowserHistory , Redirect} from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory'

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
          reDirectTo: '/register'
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.CheckStatus = this.CheckStatus.bind(this);

      }


      handleChange(e){
        this.setState({[e.target.name]: e.target.value});
      }


      handleSubmit(event){
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
            'Content-Type': 'application/json'},
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

          .then(function(response){
            console.log(response)
            if (response.status == 200){
              fetchError.setState({errors: [], reDirectTo: '/courses'})
              fetchError.setState({success: true})
              
              throw new Error("breaking promise chain early");
            }
            response.json().then(function(data){
              console.log(data)
              console.log("data length: " + data.length)
              if (data.length > 0)
                fetchError.setState({errors: data})
            })
          })
          // .then(res => this.setState({errors: res}))
          .catch(error => console.log(error))

          

          // this.MapErrors(this.state.errors);

        // fetch('/courses',{
        //   method: 'GET'
        // })
        // .then(res => console.log(res))
        // .catch(err => console.log(err))     
  
    }
    //check status of response
    CheckStatus(data){
      if(data.status == 200)
      {
        console.log(data.status)
        return data.json();
      } else if (data.status == 300){
        console.log(data)
        data = data.json();
        this.setState({errors: data})
        console.log(this.state.errors)
      } else if (data.status == 400){
        throw new Error("BAd response from server");
      }
    }


  render(){

    const errors = this.state.errors;


    return (

      <div>
      {/* <form action="/register" method="post"> */}
        <form className="register-form" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="First Name"  name="firstName" className="register-input"  onChange={this.handleChange}/>
          {/* {this.state.errors[0].msg ? this.state.errors[0].msg : null} */}
          <input type="text" placeholder="Last Name" name="lastName"className="register-input"   onChange={this.handleChange}/>
          <input type="text" placeholder="Email" name="email" className="register-input"  onChange={this.handleChange}/>
          <input type="password" placeholder="Password" name="password" className="register-input" onChange={this.handleChange}/>
          <input type="password" placeholder="Re-enter your password"  className="register-input" name="password2" onChange={this.handleChange}/>
          
          <input type="submit"  className="register-input"  /> 
          {/* // <input type="submit"  className="register-input"/> */}

          {/*
          -----THIS IS BAD -
          */}
          {errors.length > 0 ? <ul>
            {
           (errors.map(errors => 
          <li>{errors.msg}</li>))}
          </ul>
          :
          <Redirect to={this.state.reDirectTo} /> 
        }


          {console.log(errors)}
       
          

        </form>



      </div>

    );
  }
}

export default UserRegistration;

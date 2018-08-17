import React, { Component } from 'react';
import { Form, FormGroup, Input } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import history from '../../history'

import './UserLogin.css';

class UserLogin extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			value: '',
			loggedIn: false,
			email: '',
			password: '',
			url: '/login',
			errors: '',
			reDirect: false,

		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	handleSubmit(event) {
		event.preventDefault();

		var data = {
			email: this.state.email,
			password: this.state.password,
		}

		fetch('/login', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => {
				if (response.status == 200) {
					history.push("/courses");
					// this.setState({ reDirect: true })
				}
				else if (response.status == 401 || response.status == 400) {
					this.setState({
						errors: "Invalid username or password"
					})
				}
			})
			.catch(err => console.log(err))
	}

	componentDidMount() {

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
			<div className="entire-screen-login">
				<div className="login-group">
					<h1 className="welcome-message-login">Sign In</h1>
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
						{
							errors ?
								<ul className="errors">{errors}</ul>
								:
								null
						}
						{/* {this.state.reDirect ? <Redirect to={{pathname: "/courses", state: {auth: true}}} /> : null} */}
					</Form>
				</div>
			</div>

		);
	}
}

export default UserLogin;
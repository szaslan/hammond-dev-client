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
			errors: '',
			value: '',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		//not included in state so that not shown in React Developer Tool
		this.email = '';
		this.password = '';
	}

	handleChange(e) {
		this[e.target.name] = e.target.value
	}

	handleSubmit(event) {
		event.preventDefault();

		var data = {
			email: this.email,
			password: this.password,
		}

		fetch('/login', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				switch (res.status) {
					case 204:
						history.push("/courses");
						break;
					case 400:
						this.setState({
							errors: "Invalid username or password"
						})
						break;
				}
			})
	}

	render() {
		return (
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
							this.state.errors ?
								<ul className="errors">{this.state.errors}</ul>
								:
								null
						}
					</Form>
				</div>
			</div>

		);
	}
}

export default UserLogin;
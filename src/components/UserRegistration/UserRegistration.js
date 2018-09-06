import { Form, FormGroup, Input } from 'reactstrap';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Well } from 'react-bootstrap';

import './UserRegistration.css';

class UserRegistration extends Component {
	constructor(props, ) {
		super(props);

		this.state = {
			errors: [],
			loaded: false,
			msg: '',
			reDirect: false,
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.apiKey = '';
		this.email = '';
		this.firstName = '';
		this.lastName = '';
		this.password = '';
		this.password2 = '';
		this.canvasUserId = '';
	}

	handleChange(e) {
		this[e.target.name] = e.target.value;
	}

	handleSubmit(event) {
		event.preventDefault();

		this.setState({
			errors: [],
			loaded: false,
		})

		var data = {
			apiKey: this.apiKey,
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			password: this.password,
			password2: this.password2,
			canvasUserId: this.canvasUserId,
		}

		fetch('/register', {
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
						this.setState({
							errors: [],
							loaded: true,
							reDirect: true,
						})
						console.log(this.canvasUserId)
						break;
					case 400:
						res.json().then(errors => {
							this.setState({
								errors: errors,
								loaded: true,
							})
						})
						break;
					default:
				}
			})
	}

	render() {
		return (
			<div className="entire-screen-login">
				<div className="register-group">
					<h1 className="welcome-message-login">Sign Up</h1>
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
						<FormGroup>
							<Input type="text" placeholder="User Id" name="canvasUserId" className="register-input" onChange={this.handleChange} />
							<Input type="text" placeholder="API Key" name="apiKey" className="register-input" onChange={this.handleChange} />
						</FormGroup>
						<button className="new-button">Submit</button>
						<Well>
							{
								this.state.errors.length > 0 ?
									<ul className="errors">
										{
											this.state.errors.map(error =>
												<li>{error.msg}</li>
											)
										}
									</ul>
									:
									null
							}
							{
								this.state.reDirect ?
									// <Redirect to='/courses' />
									<Redirect to={{
										pathname: `${this.canvasUserId}/courses`,
										state: { canvasUserId: this.canvasUserId }
									}} />
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

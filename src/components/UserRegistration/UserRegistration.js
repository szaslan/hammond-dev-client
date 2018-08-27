import React, { Component } from 'react';
import { Form, FormGroup, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { Well } from 'react-bootstrap';

import './UserRegistration.css';

class UserRegistration extends Component {
	constructor(props, ) {
		super(props);

		this.state = {
			email: '',
			errors: [],
			firstName: '',
			lastName: '',
			loaded: false,
			msg: '',
			password: '',
			password2: '',
			reDirect: false,
		}

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

		this.setState({
			errors: [],
			loaded: false,
		})

		var data = {
			firstName: this.state.firstName,
			lastName: this.state.lastName,
			email: this.state.email,
			password: this.state.password,
			password2: this.state.password2
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
						break;
					case 400:
						res.json().then(errors => {
							this.setState({
								errors: errors,
								loaded: true,
							})
						})
						break;
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
						<button className="new-button">Submit</button>
						<Well>
							{
								this.state.errors.length > 0?
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
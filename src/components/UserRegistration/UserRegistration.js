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
			emailExists: false,
			errors: [],
			firstName: '',
			lastName: '',
			msg: '',
			password: '',
			password2: '',
			reDirect: false,
			success: false,
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

		const errors = this.state.errors;

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
			// .then(res => {
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

			.then(res => {
				if (res.status == 200) {
					this.setState({
						errors: [], reDirect: true,
						success: true
					})

					throw new Error("breaking promise chain early");
				}

				res.json().then(data => {
					if (data.length > 0)
						this.setState({
							errors: data
						})
				})
			})
			// .then(res => this.setState({errors: res}))
			.catch(err => console.log(err))
		// this.MapErrors(this.state.errors);
	}

	render() {
		const errors = this.state.errors;

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
								this.state.emailExists ?
									errors.push("Sorry that email already exists")
									:
									null
							}
							{
								errors.length > 0 ?
									<ul className="errors">
										{
											(errors.map(errors =>
												<li>{errors.msg}</li>))
										}
									</ul>
									:
									null
							}
							{/* {this.state.emailExists ? <div>Sorry that email already exists</div> : null} */}

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
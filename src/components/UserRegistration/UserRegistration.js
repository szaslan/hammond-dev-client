import { Form, FormGroup, Input } from 'reactstrap';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Well, Row } from 'react-bootstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './UserRegistration.css';

class UserRegistration extends Component {
	constructor(props, ) {
		super(props);

		this.state = {
			errors: [],
			loaded: false,
			msg: '',
			reDirect: false,
			modalVisible: false,
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.showHelpModal = this.showHelpModal.bind(this);
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

	showHelpModal() {
		this.setState({ modalVisible: !this.state.modalVisible });
	}

	render() {
		return (
			<div className="entire-screen-login">
				<div className="register-group">
					<h1 className="welcome-message-login">Sign Up</h1>
					<Form className="register-form" /*onSubmit={this.handleSubmit}*/>
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
							<Input type="text" placeholder="Canvas User Id" name="canvasUserId" className="register-input" onChange={this.handleChange} />
							<Input type="text" placeholder="Canvas API Key" name="apiKey" className="register-input" onChange={this.handleChange} />
						</FormGroup>
					</Form>

					<Row className="submit-button-row">
						<button onClick={this.handleSubmit} className="new-button">Submit</button>
						<button onClick={this.showHelpModal} className="new-button">Help</button>
					</Row>

					<Modal isOpen={this.state.modalVisible} toggle={this.showHelpModal} className="help-modal">
						<ModalHeader toggle={this.showHelpModal}>Help Page</ModalHeader>
						<ModalBody>
							<strong>How do I get my Canvas User ID and API key?</strong>
							<p>Here are the steps to obtain your Canvas User ID:
								<ol>
									<li>Log in to your Canvas account through the Canvas site</li>
									<li>Select any course from your dashboard</li>
									<li>Click the 'People' tab on the left hand side</li>
									<li>Click on your own name</li>
									<li>Check the URL at the top of the browser. It will be in the form: <br></br> https://canvas.northwestern.edu/courses/:course_id/users/:user_id</li>
									<li>Copy and paste the user_id section into respective box in Peerify’s register page</li>
								</ol>
							</p>
							<p>Here are the steps to get your Canvas API key:
								<ol>
									<li>Log in to your Canvas account through the Canvas site</li>
									<li>Click 'Account' on the sidebar on the left hand side</li>
									<li>Click 'Settings'</li>
									<li>Scroll down to the section titled 'Approved Integrations'</li>
									<li>Click the blue button that displays '+ New Access Token'</li>
									<li>Type any string of characters into the 'Purpose' field</li>
									<li>Do not set an expiration date</li>
									<li>Then click 'Generate Token'</li>
									<li>Copy and paste the token displayed into the box into the respective box in Peerify register page</li>
								</ol>
							</p>
						</ModalBody>
						<ModalFooter>
							<button onClick={this.showHelpModal}>Done</button>
						</ModalFooter>
					</Modal>

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


				</div>
			</div>
		);
	}
}

export default UserRegistration;

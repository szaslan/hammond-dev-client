import React, { Component } from 'react';
import { Collapse, CardBody, Card } from 'reactstrap';

import '../Assignments/Assignments.css';

export default class Accordion extends Component {
	constructor(props) {
		super(props);

		this.state = {
			collapse: false
		};

		this.toggle = this.toggle.bind(this);

		this.name = this.props.name;
		this.content = this.props.content;
	}

	toggle() {
		this.setState({
			collapse: !this.state.collapse
		});
	}

	render() {
		return (
			<div>
				<button className="button-student" onClick={this.toggle}>{this.name}</button>
				<Collapse className="collapse1" isOpen={this.state.collapse}>
					<Card className="card1">
						<CardBody className="cardbody1">
							{this.content ?
								this.content.map(names =>
									<li>{names}</li>
								)
								:
								"none"}
						</CardBody>
					</Card>
				</Collapse>
			</div>
		);
	}
}

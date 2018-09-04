import React, { Component } from 'react';
import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';

import './CourseCard.css'

var colors = ['#FC7753', '#66D7D1', '#9B1D20', '#3D2B3D', '#FFEFE2', '#ECDCB0', '#C1D7AE', '#4C5454', '#0B7A75', '#80A1C1' ]

function assignColor(i) {
	var i = i%10;
	return colors[i];
}

class CardComp extends Component {
	render() {
		return (
			<div>
				{/* course cards and assigning colors to courses */}
				<Card outline="false" className="card">
					<CardImg tag="div" className="class-color" style={{ backgroundColor: assignColor(this.props.coursecount) }} />
					<CardBody className="card-body">
						<CardTitle className="card-title">
							{console.log(this.props.name)}
							{this.props.name}
						</CardTitle>
					</CardBody>
				</Card>
			</div>
		);
	}
};

export default CardComp;

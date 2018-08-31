import React, { Component } from 'react';
import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';

import './CourseCard.css'

var colors = ['#FFEFE2', '#FC7753', '#66D7D1', '#9B1D20', '#3D2B3D', '#ECDCB0', '#C1D7AE', '#4C5454']

function randomColor() {
	var i = parseInt(Math.random() * colors.length, 10);
	return colors[i];
}

class CardComp extends Component {
	render() {
		return (
			<div>
				{/* course cards and assigning colors to courses */}
				<Card outline="false" className="card">
					<CardImg tag="div" className="class-color" style={{ backgroundColor: randomColor() }} />
					<CardBody>
						<CardTitle className="card-title">
							{this.props.name}
						</CardTitle>
					</CardBody>
				</Card>
			</div>
		);
	}
};

export default CardComp;
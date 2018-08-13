import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button } from 'reactstrap';
import './CourseCard.css'

var colors =[
  '#FFEFE2',
  '#FC7753',
  '#66D7D1',
  '#9B1D20',
  '#3D2B3D',
  '#ECDCB0',
  '#C1D7AE',
  '#4C5454'
]

function randomColor() {
  var i = parseInt(Math.random() * colors.length);
  return colors[i];
}


class Example extends Component {
    constructor(props){
      super(props);
    }

    render(){
      return (
        <div>
          <Card className="card">
            <CardImg className="classcolor" top height="250px;" width="300px;" style={{backgroundColor:randomColor()}} />
            <CardBody>
              <CardTitle className="cardtitle">
              {this.props.name}
                </CardTitle>
            </CardBody>
          </Card>
        </div>
      );
    }
};

export default Example;

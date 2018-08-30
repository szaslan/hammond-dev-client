import React, { Component } from 'react';
import { Ellipse } from 'react-shapes';
import { Well, Row, Col } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import ReactSvgPieChart from "react-svg-piechart";

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

class PieCharts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hoveringOverPieChart1: false,
            hoveringOverPieChart2: false,
            sectorTitle1: '',
            sectorValue1: '',
            sectorTitle2: '',
            sectorValue2: '',
        };

        this.clearPieChart1 = this.clearPieChart1.bind(this);
        this.clearPieChart2 = this.clearPieChart2.bind(this);

        this.assignmentId = this.props.assignmentId;
    }

    clearPieChart1() {
        this.setState({
            hoveringOverPieChart1: false,
            sectorTitle1: '',
            sectorValue1: '',
        })
    }

    clearPieChart2() {
        this.setState({
            hoveringOverPieChart2: false,
            sectorTitle2: '',
            sectorValue2: '',
        })
    }

    render() {
        return (
            <div>
                <Row>
                    <Col className="graph1">
                        <h5 className="graphTitle">Completion</h5>
                        <p className="graphsub">Total: {Number(localStorage.getItem("completedAllReviews_" + this.assignmentId)) + Number(localStorage.getItem("completedSomeReviews_" + this.assignmentId)) + Number(localStorage.getItem("completedNoReviews_" + this.assignmentId))}</p>

                        <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Completed all reviews", value: Number(localStorage.getItem("completedAllReviews_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Completed some reviews", value: Number(localStorage.getItem("completedSomeReviews_" + this.assignmentId)), color: '#C68100' },
                                    { title: "Completed no reviews", value: Number(localStorage.getItem("completedNoReviews_" + this.assignmentId)), color: '#AD1F1F' },
                                ]}
                                onSectorHover={(d) => {
                                    if (d) {
                                        this.setState({
                                            sectorValue1: d.value,
                                            sectorTitle1: d.title,
                                            hoveringOverPieChart1: true,
                                        })
                                    }
                                    else {
                                        this.clearPieChart1()
                                    }
                                }}
                            />
                        </Flexbox>
                        <Well className="pieinfo">
                            {this.state.hoveringOverPieChart1 ?
                                this.state.sectorTitle1 + ": " + this.state.sectorValue1 + " student" + (this.state.sectorValue1 !== 1 ? "s" : "")
                                :
                                "Hover over a sector to display completion data. There may be a slight delay."}
                        </Well>
                        <br />
                        <div className="legend">
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 === "Completed all reviews" ? { fontWeight: 'bold' } : null}>Completed all reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 === "Completed some reviews" ? { fontWeight: 'bold' } : null}>Completed some reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                <p className="compkey" style={this.state.sectorTitle1 === "Completed no reviews" ? { fontWeight: 'bold' } : null}>Completed no reviews</p>
                            </Row>
                        </div>
                    </Col>
                    <Col className="graph2">
                        <h5 className="graphTitle">Grading Classification</h5>
                        <p className="graphsub">Total: {Number(localStorage.getItem("definitelyHarsh_" + this.assignmentId)) +
                            Number(localStorage.getItem("couldBeHarsh_" + this.assignmentId)) +
                            Number(localStorage.getItem("definitelyLenient_" + this.assignmentId)) +
                            Number(localStorage.getItem("couldBeLenient_" + this.assignmentId)) +
                            Number(localStorage.getItem("definitelyFair_" + this.assignmentId)) +
                            Number(localStorage.getItem("couldBeFair_" + this.assignmentId)) +
                            Number(localStorage.getItem("spazzy_" + this.assignmentId))}</p>

                        <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Definitely Harsh", value: Number(localStorage.getItem("definitelyHarsh_" + this.assignmentId)), color: '#AD1F1F' },
                                    { title: "Could be Harsh", value: Number(localStorage.getItem("couldBeHarsh_" + this.assignmentId)), color: '#D6A0A0' },
                                    { title: "Definitely Lenient", value: Number(localStorage.getItem("definitelyLenient_" + this.assignmentId)), color: '#001887' },
                                    { title: "Could be Lenient", value: Number(localStorage.getItem("couldBeLenient_" + this.assignmentId)), color: '#B3BBDD' },
                                    { title: "Definitely Fair", value: Number(localStorage.getItem("definitelyFair_" + this.assignmentId)), color: '#063D11' },
                                    { title: "Could be Fair", value: Number(localStorage.getItem("couldBeFair_" + this.assignmentId)), color: '#94B29A' },
                                    { title: "Spazzy", value: Number(localStorage.getItem("spazzy_" + this.assignmentId)), color: '#C68100' }
                                ]}
                                onSectorHover={(d) => {
                                    if (d) {
                                        this.setState({
                                            sectorValue2: d.value,
                                            sectorTitle2: d.title,
                                            hoveringOverPieChart2: true,
                                        })
                                    }
                                    else {
                                        this.clearPieChart2()
                                    }
                                }
                                }
                            />
                        </Flexbox>
                        <Well className="pieinfo">
                            {this.state.hoveringOverPieChart2 ?
                                this.state.sectorTitle2 + ": " + this.state.sectorValue2 + " student" + (this.state.sectorValue2 !== 1 ? "s" : "")
                                :
                                "Hover over a sector to display grading classification data. There may be a slight delay."}
                        </Well>
                        <br />
                        <div className="legend">
                            <Row>
                                <Col>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Spazzy" ? { fontWeight: 'bold' } : null}>Spazzy</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Definitely Harsh" ? { fontWeight: 'bold' } : null}>Definitely Harsh</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#D6A0A0' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Could be Harsh" ? { fontWeight: 'bold' } : null}>Could be Harsh</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#B3BBDD' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Could be Lenient" ? { fontWeight: 'bold' } : null}>Could be Lenient</p>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#001887' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Definitely Lenient" ? { fontWeight: 'bold' } : null}>Definitely Lenient</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#94B29A' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Could be Fair" ? { fontWeight: 'bold' } : null}>Could be Fair</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                        <p className="graphKey" style={this.state.sectorTitle2 === "Definitely Fair" ? { fontWeight: 'bold' } : null}>Definitely Fair</p>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

            </div>
        )
    }
}

export default PieCharts;

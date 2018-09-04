import { Ellipse } from 'react-shapes';
import Flexbox from 'flexbox-react';
import ReactSvgPieChart from "react-svg-piechart";
import React, { Component } from 'react';
import { Well, Row, Col } from 'react-bootstrap';

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

        this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
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
                        {/* title and total */}
                        <h5 className="graph-title">Completion</h5>
                        <p className="graph-sub">Total: {Number(localStorage.getItem("completedAllReviews" + this.localStorageExtension)) + Number(localStorage.getItem("completedSomeReviews" + this.localStorageExtension)) + Number(localStorage.getItem("completedNoReviews" + this.localStorageExtension))} students</p>
                        <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
                            {/* react piechart to display finalized details */}
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Completed all reviews", value: Number(localStorage.getItem("completedAllReviews" + this.localStorageExtension)), color: '#063D11' },
                                    { title: "Completed some reviews", value: Number(localStorage.getItem("completedSomeReviews" + this.localStorageExtension)), color: '#C68100' },
                                    { title: "Completed no reviews", value: Number(localStorage.getItem("completedNoReviews" + this.localStorageExtension)), color: '#AD1F1F' },
                                ]}
                                //on hover, expand sector and bold corresponding label
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
                        <Well className="pie-info">
                            {this.state.hoveringOverPieChart1 ?
                                this.state.sectorTitle1 + ": " + this.state.sectorValue1 + " student" + (this.state.sectorValue1 !== 1 ? "s" : "")
                                :
                                "Hover over a sector to display completion data."}
                        </Well>
                        <br />
                        {/* color legend for pie chart */}
                        <div className="legend">
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                <p className="graph1-key" style={this.state.sectorTitle1 === "Completed all reviews" ? { fontWeight: 'bold' } : null}>Completed all reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                <p className="graph1-key" style={this.state.sectorTitle1 === "Completed some reviews" ? { fontWeight: 'bold' } : null}>Completed some reviews</p>
                            </Row>
                            <Row>
                                <Ellipse className="keycolor" rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                <p className="graph1-key" style={this.state.sectorTitle1 === "Completed no reviews" ? { fontWeight: 'bold' } : null}>Completed no reviews</p>
                            </Row>
                        </div>
                    </Col>
                    {/* second piechart for grading classification */}
                    <Col className="graph2">
                        <h5 className="graph-title">Grading Classification</h5>
                        <p className="graph-sub">Total: {Number(localStorage.getItem("definitelyHarsh" + this.localStorageExtension)) +
                            Number(localStorage.getItem("couldBeHarsh" + this.localStorageExtension)) +
                            Number(localStorage.getItem("definitelyLenient" + this.localStorageExtension)) +
                            Number(localStorage.getItem("couldBeLenient" + this.localStorageExtension)) +
                            Number(localStorage.getItem("definitelyFair" + this.localStorageExtension)) +
                            Number(localStorage.getItem("couldBeFair" + this.localStorageExtension)) +
                            Number(localStorage.getItem("spazzy" + this.localStorageExtension))} students</p>

                        <Flexbox className="chartbox" flexDirection="column" flexWrap="wrap">
                            <ReactSvgPieChart className="piechart"
                                expandSize={3}
                                expandOnHover="false"
                                data={[
                                    { title: "Definitely Harsh", value: Number(localStorage.getItem("definitelyHarsh" + this.localStorageExtension)), color: '#AD1F1F' },
                                    { title: "Could be Harsh", value: Number(localStorage.getItem("couldBeHarsh" + this.localStorageExtension)), color: '#D6A0A0' },
                                    { title: "Definitely Lenient", value: Number(localStorage.getItem("definitelyLenient" + this.localStorageExtension)), color: '#001887' },
                                    { title: "Could be Lenient", value: Number(localStorage.getItem("couldBeLenient" + this.localStorageExtension)), color: '#B3BBDD' },
                                    { title: "Definitely Fair", value: Number(localStorage.getItem("definitelyFair" + this.localStorageExtension)), color: '#063D11' },
                                    { title: "Could be Fair", value: Number(localStorage.getItem("couldBeFair" + this.localStorageExtension)), color: '#94B29A' },
                                    { title: "Spazzy", value: Number(localStorage.getItem("spazzy" + this.localStorageExtension)), color: '#C68100' }
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
                        <Well className="pie-info">
                            {this.state.hoveringOverPieChart2 ?
                                this.state.sectorTitle2 + ": " + this.state.sectorValue2 + " student" + (this.state.sectorValue2 !== 1 ? "s" : "")
                                :
                                "Hover over a sector to display grading classification data."}
                        </Well>
                        <br />
                        <div className="legend">
                            <Row>
                                <Col>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#C68100' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Spazzy" ? { fontWeight: 'bold' } : null}>Spazzy</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#AD1F1F' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Definitely Harsh" ? { fontWeight: 'bold' } : null}>Definitely Harsh</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#D6A0A0' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Could be Harsh" ? { fontWeight: 'bold' } : null}>Could be Harsh</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#B3BBDD' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Could be Lenient" ? { fontWeight: 'bold' } : null}>Could be Lenient</p>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#001887' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Definitely Lenient" ? { fontWeight: 'bold' } : null}>Definitely Lenient</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#94B29A' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Could be Fair" ? { fontWeight: 'bold' } : null}>Could be Fair</p>
                                    </Row>
                                    <Row>
                                        <Ellipse rx={7} ry={4} fill={{ color: '#063D11' }} strokeWidth={5} />
                                        <p className="graph-key" style={this.state.sectorTitle2 === "Definitely Fair" ? { fontWeight: 'bold' } : null}>Definitely Fair</p>
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

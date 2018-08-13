import React, { Component } from 'react';
import { Container, Jumbotron, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import { Row, Col } from 'react-bootstrap';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';
class TabsComp extends Component {
    constructor(props) {
        super(props);
        // this.signOut = this.signOut.bind(this);
        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: '1'
        };
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    render() {
        return (
            <div>
                <Nav tabs className="tabs-nav">
                    {/* <div className = "tabs-div"> */}
                    <Row className="tabs">
                        <NavItem className="nav-item-1">
                            <NavLink
                                className={"tab-link " + classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggle('1'); }}
                            >
                                Assignments
                                    </NavLink>
                        </NavItem>
                        <NavItem className="nav-item-2">
                            <NavLink
                                className={"tab-link " + classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Students
                                    </NavLink>
                        </NavItem>
                    </Row>
                </Nav>

                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        blah 1
                    </TabPane>
                    <TabPane tabId="2">
                        blah 2
                    </TabPane>
                </TabContent>
            </div>
        )
    }
}

export default TabsComp;
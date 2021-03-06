import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import Iframe from 'react-iframe';

import '../TabsComp/TabsComp.css'

class TabsComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '1'
        };

        // this.signOut = this.signOut.bind(this);
        this.toggle = this.toggle.bind(this);
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
                        {/* <Link to={this.props.tab1link}> */}
                        <NavItem className={"nav-item-1 " + (this.state.activeTab === '1' ? "active" : "not-active")}>
                            <NavLink
                                className={"tab-link " + classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggle('1'); }}
                            >
                                Assignments
                            </NavLink>
                        </NavItem>
                        {/* </Link> */}
                        {/* <Link to={this.props.tab2link}> */}
                        <NavItem className={"nav-item-2 " + (this.state.activeTab === '2' ? "active" : "not-active")}>
                            <NavLink
                                className={"tab-link " + classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Students
                            </NavLink>
                        </NavItem>
                        {/* </Link> */}
                    </Row>
                </Nav>

                <TabContent activeTab={this.state.activeTab}>

                    <TabPane tabId="1">
                      <div>
                      <Iframe className="iframe" url="http://localhost:3000/courses/83831/assignments"
                        width="85%"
                        height="70%"
                        />
                      </div>
                    </TabPane>

                    <TabPane tabId="2">
                      <div>
                      <Iframe className="iframe" url="http://localhost:3000/courses/83831/students"
                        width="85%"
                        height="70%"
                        />
                      </div>
                    </TabPane>
                </TabContent>
            </div>
        )
    }
}

export default TabsComp;

import classnames from 'classnames';
import Iframe from 'react-iframe';
import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';

import '../TabsComp/TabsComp.css'
import Assignments from '../Assignments/Assignments';
import CourseStudents from '../CourseStudents/CourseStudents';

class TabsComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '1'
        };

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
        let { courseJSON } = this.props;
        return (
            <div>
                <Nav tabs className="tabs-nav">
                    <Row className="tabs">
                        <NavItem className={"nav-item-1 " + (this.state.activeTab === '1' ? "active" : "not-active")}>
                            <NavLink
                                className={"tab-link " + classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggle('1'); }}
                            >
                                Assignments
                            </NavLink>
                        </NavItem>
                        <NavItem className={"nav-item-2 " + (this.state.activeTab === '2' ? "active" : "not-active")}>
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
                    {/* render pages within tabs */}
                    <TabPane tabId="1">
                        <div>
                            <Assignments courseJSON={courseJSON} />
                        </div>
                    </TabPane>

                    <TabPane tabId="2">
                        <div>
                            <CourseStudents courseId={courseJSON.id} />
                        </div>
                    </TabPane>
                </TabContent>
            </div>
        )
    }
}

export default TabsComp;
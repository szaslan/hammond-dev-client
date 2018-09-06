import { Container, Jumbotron } from 'reactstrap';
import React, { Component } from 'react';
import TabsComp from '../TabsComp/TabsComp';

import './JumbotronComp.css'

class JumbotronComp extends Component {
    constructor(props) {
        super(props)

        this.canvasUserId = this.props.canvasUserId;
    }

    render() {
        return (
            <Jumbotron className="jumbo">
                <Container className="jumbo-container" fluid>
                    <p className="main-title">{this.props.mainTitle}</p>
                </Container>
                <div className="tabcontain">
                    {
                        this.props.tabs ?
                            <TabsComp courseJSON={this.props.courseJSON} canvasUserId={this.canvasUserId}/>
                            :
                            <hr className="hr-1" />
                    }
                </div>
            </Jumbotron>
        )
    }
}

export default JumbotronComp;
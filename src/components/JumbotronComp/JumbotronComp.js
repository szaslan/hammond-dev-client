import React, { Component } from 'react';
import { Container, Jumbotron } from 'reactstrap';
import TabsComp from '../TabsComp/TabsComp';

import './JumbotronComp.css'

class JumbotronComp extends Component {
    render() {
        return (
            <Jumbotron className="jumbo">
                <Container className="jumbo-container" fluid>
                    <p className="main-title">{this.props.mainTitle}</p>
                </Container>
                <div className="tabcontain">
                    {
                        this.props.tabs ?
                            <TabsComp courseJSON={this.props.courseJSON}/>
                            :
                            <hr className="hr-1" />
                    }
                </div>
            </Jumbotron>
        )
    }
}

export default JumbotronComp;
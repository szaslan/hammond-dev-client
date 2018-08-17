import React, { Component } from 'react';
import { Container, Jumbotron } from 'reactstrap';
import TabsComp from '../TabsComp/TabsComp';

import './JumbotronComp.css'

class JumbotronComp extends Component {
    constructor(props) {
        super(props);

        // this.signOut = this.signOut.bind(this);
    }

    // signOut() {
    //     fetch('/logout', {
    //         credentials: 'include'
    //     })
    //         .then(response => console.log(response))
    // }

    render() {
        return (
            // <Jumbotron className="jumbo" fluid>
            //     <Container className="jumbo-container" fluid>
            //         <Row className="jumbo-row" fluid>
            //             <Col xs={11} className="col1" >
            //                 <Row className="row-title">
            //                     <h1 className="welcome">{this.props.secondaryTitle}</h1>
            //                 </Row>
            //                 <Row className="row-title">
            //                     <h1 className="name">{this.props.mainTitle}</h1>
            //                 </Row>
            //             </Col>
            //             <Col xs={1} className="col2">
            //                 <Link to="/logout">
            //                     <button className="pull-right signout-button" onClick={this.signOut}>Sign Out</button>
            //                 </Link>
            //             </Col>
            //         </Row>
            //     </Container>
            // </Jumbotron>

            <Jumbotron className="jumbo">
                <Container className="jumbo-container" fluid>
                    <p className="main-title">{this.props.mainTitle}</p>
                </Container>
                <div className="tabcontain">
                    {
                        this.props.tabs ?
                            <TabsComp
                                tab1link={this.props.tab_1_link}
                                tab2link={this.props.tab_2_link} />
                            :
                            <hr className="hr-1"></hr>
                    }
                </div>
            </Jumbotron>
        )
    }
}

export default JumbotronComp;
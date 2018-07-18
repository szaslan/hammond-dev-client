import React, { Component } from 'react';
import { Well, Row, Panel } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import '../Assignments/Assignments.css'

const HARSHNAME = ['James','Elizabeth','John'];


class AnalyzeButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonPressed: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      buttonPressed: !prevState.buttonPressed
    }));
  }

  render() {
    return (
      <div>
        <Flexbox className="flex-dropdown" maxWidth="300px" flexWrap="wrap" justify-content="space-around"  >
          <button onClick={this.handleClick} className="analyze">
            Analyze
          </button>
          <button className="analyze">Finalize</button>
        </Flexbox>
        {
          (this.state.buttonPressed ?
            <div>
                <Well className="well2">
                  <strong>Average Grade:</strong> 8.4/10 <br></br>
                  <strong>Completed Peer Reviews:</strong> 20/30
                  <Flexbox className="accordion-flexbox" flexDirection="column" minWidth="300px" maxWidth="500px" width="100%" flexWrap="wrap">

                    <Accordion name="Definitely Harsh" content={HARSHNAME} />
                    <Accordion name="Definitely Lenient"  />
                    <Accordion name="Missing Peer Reviews" content={HARSHNAME}/>
                  </Flexbox>
                </Well>

            </div>
            :
            <Row>
            </Row>
          )
        }
      </div>
    )
  }
}
export default AnalyzeButton;





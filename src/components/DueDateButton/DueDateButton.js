import React, { Component } from 'react';

import CalendarComp from '../CalendarComp/CalendarComp';

import 'bootstrap/dist/css/bootstrap.css';

import './DueDateButton.css'

class DueDateButton extends Component {
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
                <div>
                    <button onClick={this.handleClick} className="analyze due-date-button">Set Due Dates</button>
                </div>
                {
                    this.state.buttonPressed ?
                        <div>
                            <CalendarComp name="First Due Date" />
                            <CalendarComp name="Second Due Date" />
                            <CalendarComp name="Third Due Date" />
                        </div>
                        :
                        null
                }
            </div>
        )
    }
}

export default DueDateButton;
// import 'input-moment.less';
// import './app.less';
import moment from 'moment';
import React, { Component } from 'react';
import InputMoment from 'input-moment';
import './DueDate.css';
// import packageJson from '../../package.json';

class DueDate extends Component {
    state = {
        m: moment()
    };

    handleChange = m => {
        this.setState({ m });
    };

    handleSave = () => {
        console.log('saved', this.state.m.format('llll'));
    };

    render() {
        return (
            <div className="app">
                {/* <h1>
          {packageJson.name}: {packageJson.version}
        </h1>
        <h2>{packageJson.description}</h2> */}
                <form>
                    <div className="input">
                        <input type="text" value={this.state.m.format('llll')} readOnly />
                    </div>
                    {/* <InputMoment
            moment={this.state.m}
            onChange={this.handleChange}
            minStep={5}
            onSave={this.handleSave}
          /> */}

                    <InputMoment
                        moment={this.state.m}
                        onChange={this.handleChange}
                        onSave={this.handleSave}
                        minStep={1} // default
                        hourStep={1} // default
                        prevMonthIcon="ion-ios-arrow-left" // default
                        nextMonthIcon="ion-ios-arrow-right" // default
                    />

                </form>
            </div>
        );
    }
}
export default DueDate;
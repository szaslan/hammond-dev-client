import React, { Component } from 'react';
import { Link } from "react-router-dom";
import history from '../../history';

import PaperIcon from './PaperIcon';

import './Landing.css';

class Landing extends Component {
    constructor() {
        super();

        this.createBaseTables = this.createBaseTables.bind(this);
    }

    createBaseTables() {
        fetch('/api/createBaseTables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        break;
                    case 400:
                        res.json().then(res => {
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: 'This function is called when the students tab is clicked on from the course homepage. This function fetches the list of students currently enrolled in this course from Canvas.',
                                    error: res.error,
                                    location: "CourseStudents.js: fetchStudentsFromCanvas()",
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    default:
                }
            })
    }

    componentDidMount() {
        this.createBaseTables()
    }

    render() {
        return (

            // <div className="entire-screen" fluid>
            //     {/* <img className = "background-image" src = {require('./deering-interior-square.jpg')} /> */}
            //     <div className="screen-content">
            //         <h1 className="welcome-message"><strong>Welcome to</strong></h1>
            //         <h1 className="title-message"><strong>papr.</strong></h1>
            //         <Flexbox justifyContent="center" className="flexbox-of-buttons">
            //             <Link to="/login">
            //                 <button className="cool-button">Sign In</button>
            //             </Link>
            //             <Link to="/register">
            //                 <button className="cool-button">Register</button>
            //             </Link>
            //         </Flexbox>
            //     </div>
            // </div>
            <div className="landing">
                <div className="landing-navbar" >
                    <div className="landing-title">Peerify</div>
                    <div className="sign-in">
                        <Link to="/register" >
                            <div className="landing-register">Register</div>
                        </Link>
                        <Link to="/login" >
                            <div className="landing-login">Log in</div>
                        </Link>
                    </div>
                </div>

                <div className='description'>
                    <div className="description-text" >Grade peer reviews systematically.</div>
                    <div className="description-file-icon">
                        <PaperIcon />
                    </div>
                    <div className="description-small">
                        <p>Peerify is the easiest way to have peer reviews graded automatically, while accounting for students tendencies to grade harsh or lenient.</p>
                    </div>
                </div>

                <svg width="1280px" height="100%" viewBox="0 0 1024 1031" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="v4--8/7" transform="translate(0.000000, -404.000000)" fill="#FFE9D6">
                            <g id="background" transform="translate(-364.000000, 0.000000)">
                                <path d="M148.385118,1153.63278 C169.457234,1155.04549 833.337603,1170.47597 1142.5864,1280.66617 C1510.55673,1411.77977 1765.02499,1661.21101 1931.75444,1624.31849 C2239.00386,1556.33286 1740.40194,904.373819 1756.73482,884.494885 C1793.83438,839.340601 684.749031,884.769251 550.643762,606.835527 C416.538494,328.901803 151.578986,336.334202 192.952848,464.104193 C222.735657,556.078912 -222.656039,1128.7576 148.385118,1153.63278 Z" id="Oval-2"></path>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        )
    }
}

export default Landing;

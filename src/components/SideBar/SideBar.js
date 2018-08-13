import React from "react";
import Sidebar from "react-sidebar";
import {Link } from "react-router-dom";
import './SideBar.css'
import logo from '../logo.png'

class SidebarComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }


  signOut(){
    fetch('/logout', {
        credentials: 'include'
    })
    .then(response => console.log(response))
}

  render() {
    return (
      <Sidebar
        sidebar={<b>
          <a href=""><img className="logo" src={logo} width={"60px"}/></a>
          <br />
          <a href="" className="sidebarcontent">Account</a>
          <br/>
          <a href="" className="sidebarcontent">Courses</a>
          <br/>
          <Link to="/logout">
              <button className="signoutbutton" onClick={this.signOut}>Sign Out</button>
          </Link>
          </b>
          }
        docked={true}
        shadow={false}
        transitions={false}
        styles={{ sidebar: {background: "#FFEFE2"} } }
      >
          {this.props.content}
      </Sidebar>
    );
  }
}

export default SidebarComp;

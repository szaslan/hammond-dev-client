import React from "react";
import { Link } from "react-router-dom";
import history from '../../history';
import moment from 'moment';
import Sidebar from "react-sidebar";

import { localStorageFields, localStorageRemoveFields } from '../UserLogin/UserLogin';

import logo from '../logo.png'

import './SideBar.css'

class SidebarComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			sidebarOpen: true
		};

		this.handleLocalStorageData = this.handleLocalStorageData.bind(this);
		this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
		this.pullAllLocalStorageData = this.pullAllLocalStorageData.bind(this);
		this.saveLocalStorage = this.saveLocalStorage.bind(this);
	}

	handleLocalStorageData(data) {
		data.forEach(assignmentLevelData => {
			let assignmentId = assignmentLevelData["assignment_id"];
			let dueDateRegex = /dueDate[0-9]+/

			localStorageFields.forEach(field => {
				if (field !== "assignment_id") {
					let value = assignmentLevelData[field];
					if (value != null) {
						if (field.match(dueDateRegex)) {
							let newDate = new Date(value)
							value = moment(newDate).format('ddd MMM DD YYYY') + " " + moment(newDate).format('HH:mm:ss') + " GMT-0500";
						}
						else if (field === "finalized") {
							let newDate = new Date(value)
							value = moment(newDate).format('l') + ", " + moment(newDate).format('LTS')
						}
						localStorage.setItem(field + "_" + assignmentId, value)
					}
				}
			})
		})
	}

	pullAllLocalStorageData() {
		fetch('/api/pullAllLocalStorageData', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(res => {
				switch (res.status) {
					case 200:
						res.json().then(data => {
							this.handleLocalStorageData(data);
						})
						break;
					case 400:
						break;
					default:
				}
			})
	}
	
	onSetSidebarOpen(open) {
		this.setState({
			sidebarOpen: open
		});
	}
	
	saveLocalStorage() {
		let data = {
			localStorage: {},
			removeFields: localStorageRemoveFields,
		};

		let finalizedRegex = /finalized_/
		let dueDateRegex = /dueDate/

		for (var i = 0; i < localStorage.length; i++) {
			let field = localStorage.key(i)
			let value = localStorage.getItem(field);
			let newDate = new Date(value)

			if (field.match(finalizedRegex)) {
				value = moment(newDate).format('YYYY[-]MM[-]DD h:mm:ss');
			}
			else if (field.match(dueDateRegex)) {
				value = moment(newDate).format('YYYY[-]MM[-]DD h:mm:ss');
			}
			data.localStorage[field] = value
		}

		fetch('/api/saveAllLocalStorageData', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
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
									context: "This function is called when the Save Local Storage button is clicked from the side bar. This function takes all of the data saved to local storage and saves it into an SQL table.",
									error: res.error,
									location: "SideBar.js: saveLocalStorage()",
									message: res.message,
								}
							})
						})
						break;
					default:
				}
			})
	}

	signOut() {
		fetch('/logout', {
			credentials: 'include'
		})
	}

	render() {
		return (
			<Sidebar
				sidebar={
					<b>
						<a href="">
							<img className="logo" src={logo} width={"60px"} alt="Peerify logo" />
						</a>
						<br />
						{/*<a href="" className="sidebarcontent">Account</a>
						<br />
						<br />*/}
						<a href="/courses" className="sidebarcontent">Courses</a>
						<br />
						<button className="local-storage-save-button" onClick={this.saveLocalStorage}>Save Local Storage</button>
						<br />
						<button className="local-storage-pull-button" onClick={this.pullAllLocalStorageData}>Pull Saved Data From Local Storage</button>
						<br />
						<Link to="/logout">
							<button className="signoutbutton" onClick={this.signOut}>Sign Out</button>
						</Link>
					</b>
				}
				docked={true}
				shadow={false}
				transitions={false}
				styles={{ sidebar: { background: "#FFEFE2" } }}
			>
				{this.props.content}
			</Sidebar>
		);
	}
}

export default SidebarComp;
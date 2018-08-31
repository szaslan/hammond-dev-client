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
			sidebarOpen: true,
			downloadSuccessful: false,
			uploadSuccessful:false,
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
						// this.setState({downloadSuccessful:true});
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
					case 204: /*everything worked*/
						// this.setState({uploadSuccessful:true});
						break;

					case 400: /*something went wrong*/
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


						<a href="/courses" className="sidebarcontent">
							<svg xmlns="http://www.w3.org/2000/svg" class="ic-icon-svg ic-icon-svg--dashboard" version="1.1" x="0" y="0" viewBox="-280 -60 850 300" /*enable-background="new 0 0 280 200"*/>
								<path d="M273.09,180.75H197.47V164.47h62.62A122.16,122.16,0,1,0,17.85,142a124,124,0,0,0,2,22.51H90.18v16.29H6.89l-1.5-6.22A138.51,138.51,0,0,1,1.57,142C1.57,65.64,63.67,3.53,140,3.53S278.43,65.64,278.43,142a137.67,137.67,0,0,1-3.84,32.57ZM66.49,87.63,50.24,71.38,61.75,59.86,78,76.12Zm147,0L202,76.12l16.25-16.25,11.51,11.51ZM131.85,53.82v-23h16.29v23Zm15.63,142.3a31.71,31.71,0,0,1-28-16.81c-6.4-12.08-15.73-72.29-17.54-84.25a8.15,8.15,0,0,1,13.58-7.2c8.88,8.21,53.48,49.72,59.88,61.81a31.61,31.61,0,0,1-27.9,46.45ZM121.81,116.2c4.17,24.56,9.23,50.21,12,55.49A15.35,15.35,0,1,0,161,157.3C158.18,152,139.79,133.44,121.81,116.2Z"></path>
							</svg>
							<p className="icon-text">Dashboard</p>
						</a>

						<button className="icon-button local-storage-save-button" onClick={this.saveLocalStorage}>
							{/* <i class="material-icons">cloud_upload</i> */}
							<img className="icon-cloud" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAN1SURBVGhD7dhbqFRVHMfx0VJTHxRUJMT0QUXN8vJSoomRUt4RFRQTUhQtSxCR1Hwxi/CCIhUoKuINRR9EEcGiwLwliA9eClRKKxBJQsgL3tLvd5/ZspkzZ85xZs2ZSfYPPnjWdmbN+s/svfZaO5MmTZqqSBu8h4+wGPMwEf3RBFWdppiM7/EIj+vwF75FN1Rd3sAZxIO9hR/wNZZhDXbgIuLX3MM3aIuqyMe4Dwd3FtPQAnWlNyzQQnzPr+iOiuZTOJgHWIgX0dB4ap2E7/8Hr6Ei8eJ1ELfxjgeKyEvYCfu5gg4oS7pgNBz0ALwA0wk38RBjPVBC/BW9nizmkAdC5i0cg50nXcb72Jptr0CItMPfsM9if91a+QR+03Z6A/vhjHMa/yEu6jpaIVS819jv8ahVYsbBwcYXb3Mk0xfxNOuNLmT8LC96P7+zB4pNM/wOB+kUWldaYhR8fehsh58/N2oVmXdhJz9GrcpkBhzDpqhVZD6HnXwYtSqTYXAMRc1enpuzcRV2MhKVitegY3Bieab0w3n4Zp1AJdc+A+E4vOhdh01CoeVOlLfxL3zjYVhUpfMKLCL+YuU0Pwt5l/894J3ZFy5FNe0RXD28jOHYDG8FjnMvav06zkz+57qoFTYOoH3Nn0HyOlxRON7dHogzBB78A94TQmYCXNK7nA+5AHRt9ycc99N73AZ4wCV4yMRF2LfOIWQxY2C/v8HdaOaX7IE+NgIlt4hY6GIuwH4H23AbasO9QIgkiziQ/dcvy51f6GJWwz4X2biTbeQuCItJsohVcJfn30fhzBO6mHiFvNbGpWyjq40S0hHxvtsiTLIQkyxmjwdKzHzYV7QPcj62MdNGCXFO34XPolZNcgsxFrMPH0St0uJ9xf6j1fHUbOMUQt8I8xUSKn5x12D/PeMD8b7DZXPIlLOQBbDvn6NWNuPhTsxzPNgemZSrEG/ijtUxD/VAMl/BD3Ut43ke4i4fuhCfsMzBXdjvF6gVr48liJ/Tev6thxflCLjJKSTfeqq+Qtxv5Osr1xR8iXiGlTNVwWv6TeR79FOfn5CbQoX0QvIpTEN5N/cZQYPjB/nkZCMOwqfqdXH/Mh25KVRIa2xBvv6SvsM2LMcgROuqxk65LvZGT1pItSUtpNry3BTyKizkSNT6H8clxUq4v06TJk2aNNlkMk8AyNwm373W3zcAAAAASUVORK5CYII=" />
							<p className="icon-text">Save Data</p>
						</button>
						<br />

						<button className="icon-button local-storage-pull-button" onClick={this.pullAllLocalStorageData}>
							{/* <i class="material-icons">cloud_download</i> */}
							{/* <svg xmlns="http://www.w3.org/2000/svg" class="ic-icon-svg ic-icon-svg--pull" version="1.1" x="0" y="0" viewBox="-275 0 900 200">
								<img src="outline_cloud_download_black_18dp.png" />
							</svg> */}
							<img className="icon-cloud" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAN/SURBVGhD7ZlZqJRlGIBPbqUhChYpYnZhotHqjYoLioWZpQgKWhYVheYGIuJ+oRYRiBEZJCriEgjeKIhLoRfugnghLqDiDuJCCFmWWfY8v/PFz5yZ8Th+4/wD88DDmfc7M9+875n51tNQp06dTNAO38ZJOAen4Wh8A5/ATNMMx+Iv+A/eK+Jl/AG7YebojUcwJHsLd+L3uBCX4no8heE5f+EybI+ZYAreQZM7ih/ik1iMl9ACLcTXnMQXsarMQpP5G2diC2wqfrUOoK//FV/BquDgNYnfcYgNZfAU/oT2cx6fxYrQFd9Fk+6FzVE64028iyNseAT8FB1PFrPVhpgMwL1o52nP4Hhck4u/wRh0wOton+V+uo2Yiv6l7fQGbkZnnMP4L4airmIbjIVrjf3uS6JHZCSabBi8rTDNaximWRe6mPheDnrfv4sN5dISz6FJOoUWozUOR58fm3Xo+09OojIZinayK4mqw6doDiuTqEwWoZ18kUTV4U00h7JmL7+bE/AC2sk7WC0cg+bgxPJQvI7H0Bfrfqzm3qcvmoeD3n3YGCy13UkYjL+hL9yBFlVtnkeLCH9YdZr/HAtu/7ujK7NPnI9ZOiO4e+iEb+EqdCkwz43Y6NNxZvKX3yVRtnkV3VGY7wYbAgPRxovomlALuLe7hOb9/xq3HG1wC15LvIfmfRY9jTacyDW8bFABHLBt7z+MznE09/4GHkMNPAvEpiN68tuURPFZguY+2+CPXJC/IYyBpzz73pNE8Qk75G8NTueCFwwiU+lCpqP9J+cg52ODzwwiU+lCXFfsP9kdf5ALDmHshbCShbgYXkH77xEawrnDbXNMKlnIDLTvg0mUYxR6EnOGiXZGhkoV4iJuruY8yIY0X6Nv6l5mHsZY5WMX4g3LRLyN9vslNsLxMRfDPa3fvx/xYxyGHnJK+Qzm86BCPG8U6ivfcfgVhhlWnalKjuk+WOjq50HuxnxKFdIT07cwTdXV3DuCJuMbeXOyAregt+rF9PzyCeZTqpCncTUW6i/tz7gWF2M/TPZVj5tKDfbHTr2QauNlgdv2QLFCvEt+7v7D7OFNvbPQNbQAKVTIArTNO+RM4myyDU0yFJNfSCjCS3H/v5hZ3A1sx1DM+7nHFpIuwkU286SLCf8X/DP3s2aKCKSLCdZcEYF0MTVbRMBi3N58lER16tQaDQ3/Aa7bJvapMpnvAAAAAElFTkSuQmCC" />
							{/* <img className="icon-cloud"src="data:image/png;base64,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"></img> */}
							<p className="icon-text">Refresh Data</p>
						</button>
						<br />
						<Link to="/logout">
							<button className="signoutbutton" onClick={this.signOut}>Sign Out</button>
						</Link>
					</ b>
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

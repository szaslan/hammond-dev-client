import React, { Component } from 'react';

function blahfunction() {
    return 'Do you really want to leave this page?';
};

class Daddy extends Component {
    constructor() {
        super();

        this.state = {
            leaving: false,
        }

        this.onUnload = this.onUnload.bind(this);
    }

    onUnload(event) { // the method that will be used for both add and remove event
        console.log(event)
        event.returnValue = "Hellooww"
    }
    
    componentDidMount() {
        // console.log("mount")
        window.addEventListener("beforeunload", this.onUnload)
    }
    // componentDidUpdate() {
    //     console.log("update")
    // }
    componentWillUnmount() {
        // window.alert("hi")
        // console.log("unmount")
        // this.setState({
            // leaving: true,
        // })
        window.removeEventListener("beforeunload", this.onUnload)
    }

    render() {
        // function blahfunction() {
        //     return 'Do you really want to leave this page?';
        // };
        // if (this.state.leaving) {
            // window.onbeforeunload = blahfunction;
        // }

        return (
            <div></div>
        );
    }
};

export default Daddy;
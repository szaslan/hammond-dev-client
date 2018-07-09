import React, { Component } from 'react';
import './AssignmentInfo.css';
import Loader from 'react-loader-spinner'



class AssignmentInfo extends Component{
    constructor(props){
        super(props);


        this._fetchAssignmentData = this._fetchAssignmentData.bind(this);
        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            assignment: [],
            url: '',
            id: this.props.match.params.assignment_id,
        }
    }
    //

    static getDerivedStateFromProps(nextProps, prevState){
        if (nextProps.match.params.assignment_id !== prevState.id){
            return {
            id: nextProps.match.params.assignment_id,
            assignment: null
            }
        }
        return null;
    }


        //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
        componentDidMount(){
            console.log("component mounted!");
            this._fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps){
        if(this.props.match.params.assignment_id !== prevProps.match.params.assignment_id){
            console.log("componendidupdate!");
            this._fetchAssignmentData();
        }  
    }

    //
    // componentWillReceiveProps(nextProps){
    //     if (nextProps.match.params.assignment_id !== this.props.match.params.assignment_id){
    //         this.setState({id: nextProps.match.params.assignment_id});
    //         console.log(nextProps);
    //     }
    // }

    //fetches assigment data
    _fetchAssignmentData(){
        const { match: { params } } = this.props;
        console.log("fetched!");
        this.setState({url: `/courses/${params.course_id}/assignments/`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/assignments/${params.assignment_id}?access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(assignment => this.setState({assignment}))
    }

   




    render(){

        if (this.state.assignment === null)
        return(
            <div className="assignment-info">
            <Loader type="Circles" color="black" height={80} width={80} />
            </div>
        )
        else {
            return (
                <div className="assignment-info" >
                {console.log(this.state.assignment)}
                    <div>{this.state.assignment.name}</div>
                    <div>Assignment ID: {this.state.assignment.id}</div>
                    <div>Points Poissible: {this.state.assignment.points_possible}</div>
                </div>
            )
        }
        // return(
        //         <div className="assignment-info" >

        //             {this.state.assignment 
        //         ? 
                    
        //             this.state.assignment.name
              
        //         :
        //         <Loader type="Circles" color="black" height={80} width={80} />
        //     }
        //             {console.log(this.state.assignment)}
        //         </div>
        // );
    }


}

export default AssignmentInfo;

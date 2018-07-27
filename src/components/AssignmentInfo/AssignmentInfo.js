import React, { Component } from 'react';
import './AssignmentInfo.css';
import Loader from 'react-loader-spinner'
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';

function FilterRubricAssessments(props) {
    const currPeerReview = props.currPeerReview;
    const currAssessment = props.currAssessment;

    if (currPeerReview.asset_id === currAssessment.artifact_id && currPeerReview.assessor_id === currAssessment.assessor_id) {
        return (
            <li> {currAssessment} </li>
        )
    }
    else {
        return null;
    }
}

class AssignmentInfo extends Component{
    constructor(props){
        super(props);


        this._fetchAssignmentData = this._fetchAssignmentData.bind(this);
        this.state = {
            apiKey: "1876~H4edcIGWB68NtnF4eCsFLVEvBMa0NEqBmFNhxeX6LGWOQoOlmugN7tAwOIKmdB9H",
            assignment: [],
            url: '',
            id: this.props.match.params.assignment_id,
            assignmentClicked: false,
            peerreviewJSON: [],
            rubricJSON: [],
            ...props,
        }
    }
 
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
            console.log("assignmentinfo mounted!");
            this._fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps){
        if(this.props.match.params.assignment_id !== prevProps.match.params.assignment_id){
            console.log("component did update!");
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
        this.setState({assignmentClicked: true});
        
        console.log("1: fetching assignment data from canvas");
        this.setState({url: `/courses/${params.course_id}/assignments/`});

        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/assignments/${params.assignment_id}?access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(res => this.setState({assignment: res}))
    }

    render(){

        if (this.state.assignment === null)
        return(
            <div className="assignment-info">
                <Loader type="TailSpin" color="black" height={80} width={80} />
            </div>
        )
        else {
            return (
                // <div className="assignment-info" >
                    //<div className="assigment-labels">{this.state.assignment.name}</div>
                    //<div className="assigment-labels">Assignment ID: {this.state.assignment.id}</div>
                   // <div className="assigment-labels">Points Poissible: {this.state.assignment.points_possible}</div>
                   // <button className="assigment-labels buttons">Analyze!</button>
                   // <button className="assigment-labels buttons">Finalize!</button>
                   
                <div>
                   <div className="assignment-info">
                           <strong>Title:</strong> {this.state.assignment.name}
                           <AnalyzeButton 
                                assignment_info={this.state.assignment} 
                                course_id={this.props.match.params.course_id} 
                                assignment_id={this.props.match.params.assignment_id} 
                                apiKey={this.state.apiKey}
                            />
                   </div>
       
                   {/* <ul>
                       {this.state.rubricJSON.assessments.map(assessments =>
                           {this.state.peerreviewJSON.map(peerreviewJSON => 
                               <FilterRubricAssessments currPeerReview={peerreviewJSON} currAssessment={assessments}/>
                           )}
                       )}
                   </ul> */}
               </div>
                    
//                </div>
            )
        }

    }


}

export default AssignmentInfo;

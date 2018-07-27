import React, { Component } from 'react';
import './StudentInfo.css';
import Loader from 'react-loader-spinner'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EventEmitter } from 'events';


//filter for only peer reviewable assignments
function FilterAssignments(props) {
    const currAssignment = props.currAssigment;
    
    if (currAssignment.peer_reviews){
        return (
            <DropdownItem onClick={props.click} id={props.id}>{currAssignment.name}</DropdownItem>
        )
    }
    else {
        return null;
    }
}



class StudentInfo extends Component{
    constructor(props){
        super(props);

        this.getPeerReviews = this.getPeerReviews.bind(this);
        this.toggleReview = this.toggleReview.bind(this);
        this.toggleAssignment = this.toggleAssignment.bind(this);
        this._fetchAssignmentData = this._fetchAssignmentData.bind(this);
        this.select = this.select.bind(this);
        this.selectPeerReview = this.selectPeerReview.bind(this);

        this.state = {
            
            student: [],
            assignments: [],
            peer_reviews: [],
            url: '',
            id: this.props.match.params.assignment_id,
            dropdownOpen: false,
            peerReviewOpen: false,
            selectedAssignment: '',
            selectedStudent: '',
            value: 'Select an Assignment',
            value2: 'Select a Peer Review',
            noPeerReview: false,
            scoreGiven: '',
            finalScore: '',
            errorMessage: 'No peer reviews for this student!',
            ...props,
            
        }
    }
 //if props are changed, this runs
    // static getDerivedStateFromProps(nextProps, prevState){
    //     if (nextProps.match.params.assignment_id !== prevState.id){
    //         return {
    //         id: nextProps.match.params.assignment_id,
    //         assignment: null
    //         }
    //     }
    //     return null;
    // }

        //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
        componentDidMount(){
            console.log("component mounted!");
            this.setState({errorMessage: " "})
            this._fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps){
        if(this.props.location.state.student_name !== prevProps.location.state.student_name){
            console.log("component did update!");

                this.setState({errorMessage: ""})
            
            this.setState({value: "Select an Assignment",
                            value2: "Select a Peer Review",
                            peer_reviews: []})
            // this._fetchAssignmentData();
        }  
    }


    //fetches assigment data
    _fetchAssignmentData(){
        const { match: { params } } = this.props;
        this.setState({studentClicked: true});

        let data = {
            course_id: params.course_id,
        }

        fetch('/api/assignments',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(assignments => this.setState({assignments}))


       /* NEED TO FETCH STUDENT INFO AND SET STATE TO FETCHED INFO WHEN PROPS ARE UPDATED
        fetch(/api/students)/
        */

    }

    getPeerReviews(){
        let data = {
            student_id: this.props.location.state.student_id,
            assignment_id: this.state.selectedAssignment,
        }
        console.log('getPeerReview()');

        let get = this;

        fetch('/api/get_peer_reviews',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(function(res){ 
            console.log(res)
            if (res.status == 404)
            {
                get.setState({errorMessage: "No peer reviews for this student!"})
                
            }
            else res.json().then(function(data){
    
                console.log(data);
                get.setState({peer_reviews: data})
                    // if (get.state.peer_reviews == []){
                    //     get.setState({errorMessage: "No peer reviews for this student!"})
                    //     console.log(get.state.errorMessage)
                
                    // }    
            
               
             
            })
        })
        
    
    }

    toggleAssignment() {
        this.setState(prevState => ({
          dropdownOpen: !prevState.dropdownOpen,
        }));
      }

      toggleReview() {
          this.setState(prevState => ({
            peerReviewOpen: !prevState.peerReviewOpen,
          }))
      }

    select(event) {
        console.log(event.target)
        
        this.setState({
          value: event.target.innerText,
          selectedAssignment: Number(event.target.id),
          value2: 'Select a Peer Review'
        }, () => {
            this.getPeerReviews();
            console.log('ran get peer reviews')
        })
        console.log(this.state.selectedAssignment)
      }

      selectPeerReview(event){
          console.log(event.target)
          this.setState({
              value2: event.target.innerText,
              selectedStudent: Number(event.target.id)
          })

          

          let data = {
              assignment_id: this.state.selectedAssignment,
              assessor_id: this.props.location.state.student_id,
              user_id: Number(event.target.id)
          }

          console.log(data);

          fetch('/api/peer_review_grade',{
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          })
          .then(res => res.json())
          .then(function(data){
              this.setState({scoreGiven: data.score_given,
                            finalScore: data.final_score})

          })
      }



    render(){
            return (   
                <div className="student-info">
                        {/*THIS BELOW SHOULD BE THIS.STATE.STUDENT*/}
                        <div className="student-name">{this.props.location.state.student_name}</div>
                            <Dropdown className="dropdowns" isOpen={this.state.dropdownOpen} toggle ={this.toggleAssignment} >
                            <DropdownToggle caret>
                                {this.state.value}
                            </DropdownToggle>
                                <DropdownMenu >

                                    {
                                        this.state.assignments.map(assignment => 
                                            <FilterAssignments id={assignment.id} click={this.select} currAssigment={assignment} /> 
                                        )
                                    }

                                </DropdownMenu>
                            </Dropdown>

                            {this.state.peer_reviews.length > 0
                                ?

                        <Dropdown  className="dropdowns" isOpen={this.state.peerReviewOpen} toggle={this.toggleReview} >
                            <DropdownToggle caret>
                                {this.state.value2}
                            </DropdownToggle>
                                <DropdownMenu >
                                    {
                                        this.state.peer_reviews.map(currPeerReivew => 
                                            <DropdownItem id={currPeerReivew.id} onClick={this.selectPeerReview}>{currPeerReivew.name}</DropdownItem>
                                        )
                                    }
                                   
                                </DropdownMenu>
                            </Dropdown>
                                :
                                                                
                                <div>{this.state.errorMessage}</div>
                               
                                
                                
                        }

                        <div>{this.state.scoreGiven}</div>
                        <div>{this.state.finalScore}</div>


             
               </div>
                    
//                </div>
            )
        }

    }


export default StudentInfo;

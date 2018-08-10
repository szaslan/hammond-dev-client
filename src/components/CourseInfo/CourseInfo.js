import React, { Component } from 'react';
import './CourseInfo.css';
import { Link } from "react-router-dom";
import { Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import history from '../../history'
import { Container } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp'
import '../BreadcrumbComp/BreadcrumbComp.css';
import Loader from 'react-loader-spinner'


class CourseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseJSON: [],
            courseID: '',
            url: '',
            auth: false,
            loaded: false,
            ...props
        }
    
    }
    

    // componentWillMount(){
    //     if(this.state.location.state.auth){
    //         this.setState({auth: true})
    //     }
    // }
    componentDidMount() {
        const { match: { params } } = this.props;
        
        this.setState({ url: `/courses/${params.course_id}` });

        
        var data = {
            course_id: params.course_id,
        }
        console.log(data);
        fetch('/api/courseinfo',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        
        .then(res => {
            if (res.status === 401){
                console.log("4040404")
                history.push("/login")
                throw new Error();
                
                // return <Redirect to="/" />
                // window.location.href="/login"
            }  
            {
                res.json().then(data =>
                {
                    this.setState({courseJSON: data, loaded: true})
                }).catch(() => this.setState({error: true, loaded: true}))
            }
        })
        .catch(err => console.log(err))
    }


    render() {

        // if (!this.state.auth){
        //     return(
        //         <div>Not authenticated</div>
        //     )
        // }
        if (this.state.error) {
        return (
            <div>
                <JumbotronComp  mainTitle= {this.state.courseJSON.name}
                    secondaryTitle="&nbsp;"/>
                    
                    <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div>Oops! There was a problem on our end.</div>
                </div>
        )
    }    
        return (
            <div>          
                <JumbotronComp  mainTitle= {this.state.courseJSON.name}
                secondaryTitle="&nbsp;"/>
                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                </Breadcrumb>
                {this.state.loaded ? 
                    <div className='courseinfo-buttons'>
                        <div>   
                             <Link to={{pathname: this.state.url + '/'+ this.state.courseJSON.name + "/assignments/", state: {name: this.state.courseJSON.name}, }}>
                                <button className="pull-left big-button">Assignments</button>
                            </Link>
                        </div>
                        <div>
                            <Link to={{pathname: this.state.url + "/"+this.state.courseJSON.name + "/students", state: {name: this.state.courseJSON.name}}}>
                                <button className="pull-right big-button">Students</button>
                            </Link>
                        </div>
                    </div>
                    
                 :
                 <Loader type="TailSpin" color="black" height={80} width={80} />
                 }
            </div>

        );

}


}

export default CourseInfo;

import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from 'react-bootstrap/Button';

import Modal from 'react-bootstrap/Modal';

import { authenticationService } from '../services/authentication.service';
import { authHeader } from '../helpers/auth-header';

export class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // store currently logged in user details for displaying 
            // their projects and priveleges regarding the same
            currentUser: authenticationService.currentUserValue,
            
            // initialise list of projects the currently
            // logged-in user is a part of
            project_list: [],
            
            // variable to decide whether to display the Add-project modal box
            displayProjectBox: false,
            
            /* fetch all signed-up users, 
            to decide non-participants for a project */
            userList: [],

            /* initialise the participants-list for a project,
            which the currently logged-in user would want to see */
            participantList: [],

            /* initialize a list of non-participants w.r.t.
            a project, so as to display add-delete user from
            a project functionality which will be basically
            equal to userList-participantList */
            nonParticipantList: [],

            /* open modal box for editing participants of
            a project  */
            canAddParticipants: false,

            /* open modal box for viewing 
            project participants */
            canViewParticipants: false,
            
            // store current project ID to edit participants
            currProjectID: 0
        };
    }

    componentDidMount() {
        const project_url = "/project/all";
        authHeader();
        axios.get(project_url, { headers: authHeader() }).then((response) => {
            const projects_array = response.data.projects;
            this.setState({
                project_list: projects_array
            });
        });
        const get_all_users_url = "/all_users";
        authHeader();
        axios.get(get_all_users_url, { headers: authHeader() }).then((response) => {
            const all_users_list = response.data.accounts;

            this.setState({
                userList: all_users_list
            });
        });
    }

    openProjectBox = () => {
        this.setState({
            displayProjectBox: true
        });
    }

    handleClose = () => {
        this.setState({
            displayProjectBox: false
        });
    }

    handleCloseParticipants = () => {
        this.setState({
            canAddParticipants: false,
            canViewParticipants: false
        });
    }

    render() {
        const { currentUser } = this.state;
        return (
            <div class="jumbotron">
                <Modal show={this.state.displayProjectBox} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Project Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <Formik
                                initialValues={{
                                    projectName: '',
                                    projectDesc: ''
                                }}
                                validationSchema={Yup.object().shape({
                                    projectName: Yup.string().required('project name is required'),
                                    projectDesc: Yup.string().required('Project description is required')
                                })}
                                onSubmit={({ projectName, projectDesc }, { setStatus, setSubmitting }) => {
                                    setStatus();
                                    const create_project_url = "/project/new";
                                    authHeader();
                                    const requestOptions = {
                                        "name": projectName,
                                        "desc": projectDesc
                                    };
                                    axios.post(create_project_url, requestOptions, { headers: authHeader() }).then((response) => {
                                        const new_project = response.data.project;
                                        var temp_project_list = this.state.project_list;
                                        temp_project_list.push(new_project);
                                        this.setState({
                                            project_list: temp_project_list
                                        });
                                    });
                                    setSubmitting(false);
                                    this.setState({
                                        displayProjectBox: false
                                    });
                                }} >
                                {(props) => (
                                    <Form>
                                        <div className="form-group">
                                            <label htmlFor="projectName">Project Name</label>
                                            <Field name="projectName" type="text" className={'form-control' + (props.errors.projectName && props.touched.projectName ? ' is-invalid' : '')} />
                                            <ErrorMessage name="projectName" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="projectDesc">Project Description</label>
                                            <Field name="projectDesc" type="text" className={'form-control' + (props.errors.projectDesc && props.touched.projectDesc ? ' is-invalid' : '')} />
                                            <ErrorMessage name="projectDesc" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-primary" disabled={props.isSubmitting}>Confirm Project Details</button>
                                            {props.isSubmitting &&
                                                <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" alt="" />
                                            }
                                        </div>
                                        {props.status &&
                                            <div className={'alert alert-danger'}>{props.status}</div>
                                        }
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </Modal.Body>
                </Modal>
                {/* The 2nd modal displays all users, and their statuses as to whether they are the participants
                of the project or not */}
                {

                    <Modal show={this.state.canAddParticipants} onHide={this.handleCloseParticipants}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Project Participants</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ul className="list-group">
                                {
                                    this.state.participantList.map((participant) => {
                                        const username = participant.username
                                        const uid = participant.ID
                                        return <li key={uid} className="list-group-item">{username}<Button variant="success" id={uid + "add"} style={{ float: "right" }} disabled={true} onClick={() => {
                                        }}>Add</Button><Button variant="danger" style={{ float: "right", marginRight: "3px" }} disabled={false} onClick={ () => {
                                            var newNonParticipantList = this.state.nonParticipantList;
                                            newNonParticipantList.push(participant);
                                            const curr_user_list = this.state.userList;
                                            var newParticipantList = [];
                                            curr_user_list.forEach((user) => {
                                                var isParticipant = true;
                                                newNonParticipantList.forEach((non_participant) => {
                                                    if(non_participant.ID === user.ID){
                                                        isParticipant = false;
                                                    }
                                                });
                                                if(isParticipant){newParticipantList.push(user);}
                                            });
                                            const proj_id = this.state.currProjectID;
                                            const remove_user_from_project = "/project/" + proj_id + "/delete/user/" + uid;
                                            axios.delete(remove_user_from_project, { headers: authHeader() });
                                            this.setState({
                                                participantList: newParticipantList,
                                                nonParticipantList: newNonParticipantList
                                            });

                                        }}>Delete</Button></li>
                                    })
                                }
                                {
                                    this.state.nonParticipantList.map((nonparticipant) => {
                                        const username = nonparticipant.username
                                        const uid = nonparticipant.ID
                                        return <li key={uid} className="list-group-item">{username}<Button variant="success" id={uid + "add"} style={{ float: "right" }} disabled={false} onClick={() => {
                                            const participant_list = this.state.participantList;
                                            participant_list.push(nonparticipant);
                                            const user_list = this.state.userList;
                                            var non_participant_list = [];
                                            user_list.forEach((user) => {
                                                var isParticipant = false;
                                                participant_list.forEach((participant) => {
                                                    if(user.ID === participant.ID){isParticipant = true;}
                                                });
                                                if(!isParticipant){non_participant_list.push(user);}
                                            });
                                            this.setState({
                                                participantList: participant_list,
                                                nonParticipantList: non_participant_list
                                            })
                                            const proj_id = this.state.currProjectID;
                                            const add_user_to_project = "/project/" + proj_id + "/add/user/" + uid;
                                            axios.post(add_user_to_project, {}, { headers: authHeader() });

                                        }}>Add</Button><Button variant="danger" style={{ float: "right", marginRight: "3px" }} disabled={true}>Delete</Button></li>
                                    })
                                }
                            </ul>
                        </Modal.Body>
                    </Modal>
                }

                {/* The 3rd modal displays all users who are project participants */}
                {
                    <Modal show={this.state.canViewParticipants} onHide={this.handleCloseParticipants}>
                        <Modal.Header closeButton>
                            <Modal.Title>Project Participants</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ul className="list-group">
                                {
                                    this.state.participantList.map((participant) => {
                                        const username = participant.username
                                        const uid = participant.ID
                                        return <li key={uid} className="list-group-item">{username}</li>
                                    })
                                }
                            </ul>
                        </Modal.Body>
                    </Modal>
                }
                {/* 3rd Modal code end */}

                <h1>Hi {currentUser.data.account.username}!</h1>
                <h3>Your Projects:</h3>
                <div id="all_projects" className="list-group">
                    {
                        this.state.project_list.map((project) => {
                            const name = project.name
                            const id = project.ID
                            const curr_uid = currentUser.data.account.ID
                            const isCreator = (curr_uid === project.user_id)
                            return <li key={id} className="list-group-item"><Link key={id} to={{ pathname: '/issues', state: { project_id: id, project_name: name } }}  >{name}</Link>{isCreator && <Button variant="success" style={{ float: "right" }} onClick={() => {
                                const project_users_url = "/project/" + id + "/all_users";
                                authHeader();
                                axios.get(project_users_url, { headers: authHeader() }).then((response) => {
                                    const all_users_list = response.data.participants;
                                    const all_users = this.state.userList;
                                    var non_participants = [];
                                    all_users.forEach((user) => {
                                        var is_participant = false;
                                        all_users_list.forEach((participant) => {
                                            if (user.ID === participant.ID) { is_participant = true; }
                                        });
                                        if (!is_participant) { non_participants.push(user); }
                                    });
                                    this.setState({
                                        participantList: all_users_list,
                                        nonParticipantList: non_participants
                                    })
                                });
                                this.setState({
                                    canAddParticipants: true,
                                    currProjectID: id
                                });
                            }}>Add Participants</Button>}<Button variant="warning" style={{ float: "right", marginRight: "5px" }} onClick={() => {
                                const project_users_url = "/project/" + id + "/all_users";
                                authHeader();
                                axios.get(project_users_url, { headers: authHeader() }).then((response) => {
                                    const all_users_list = response.data.participants;
                                    this.setState({
                                        participantList: all_users_list,
                                        canViewParticipants: true
                                    });
                                });
                            }}>View Participants</Button></li>
                        })
                    }
                </div>
                <button className="btn btn-primary" onClick={this.openProjectBox} style={{ marginTop: "20px" }}>Add New Project</button>
            </div >
        );
    }
}

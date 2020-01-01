import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { authenticationService } from '../services/authentication.service';
import { authHeader } from '../auth-header';


export class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            project_list: [],
            displayProjectBox: false
        };
    }

    componentDidMount() {
        const project_url = "/projects/all";
        authHeader();
        axios.get(project_url, { headers: authHeader() }).then((response) => {
            const projects_array = response.data.projects;
            this.setState({
                project_list: projects_array
            });
        });
    }

    openProjectBox = () => {
        this.setState({
            displayProjectBox: true
        });
    }

    render() {
        const { currentUser } = this.state;
        return (
            <div>
                {this.state.displayProjectBox &&
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
                                const create_project_url = "/projects/new";
                                authHeader();
                                const requestOptions = {
                                    "projectName": projectName,
                                    "projectDesc": projectDesc
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
                            }}
                            render={({ errors, status, touched, isSubmitting }) => (
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="projectName">Project Name</label>
                                        <Field name="projectName" type="text" className={'form-control' + (errors.projectName && touched.projectName ? ' is-invalid' : '')} />
                                        <ErrorMessage name="projectName" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="projectDesc">Project Description</label>
                                        <Field name="projectDesc" type="text" className={'form-control' + (errors.projectDesc && touched.projectDesc ? ' is-invalid' : '')} />
                                        <ErrorMessage name="projectDesc" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Confirm Project Details</button>
                                        {isSubmitting &&
                                            <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" alt="" />
                                        }
                                    </div>
                                    {status &&
                                        <div className={'alert alert-danger'}>{status}</div>
                                    }
                                </Form>
                            )}
                        />
                    </div>
                }
                <h1>Hi {currentUser.data.account.username}!</h1>
                <p>You're logged in with React & JWT!!</p>
                <h3>Users from secure api end point:</h3>
                <div id="all_projects" className="list-group">
                    {
                        this.state.project_list.map((project) => {
                            const name = project.projectName
                            const id = project.ID
                            const curr_uid = currentUser.data.account.ID
                            const isCreator = (curr_uid === project.created_user_id)
                            return <Link key={id} to={{ pathname: '/issues', state: { project_id: id, project_name: name } }} className="list-group-item" >{name}{isCreator && <button className="btn btn-primary" style={{float: "right"}}>Add Participant</button>}</Link>
                        })
                    }
                </div>
                <button className="btn btn-primary" onClick={this.openProjectBox}>Add New Project</button>
            </div>
        );
    }
}

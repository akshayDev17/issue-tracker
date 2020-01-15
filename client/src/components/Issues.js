import React, { Component } from 'react';
import axios from 'axios';

// imports for generating the entire card structure
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';

// imports for generating the modal 
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// imports for generating form
import { Form, ErrorMessage, Formik, Field } from 'formik';
import * as Yup from 'yup';

// styling for the card-column-board structure
import '../index.css';

import { authenticationService } from '../services/authentication.service';
import { createIssue } from '../services/createIssue.service';
import { AssignIssue } from '../services/assignIssue.service';
import { authHeader } from '../helpers/auth-header';
import { Board } from './Board';

import get_issues_array from '../helpers/issue_helpers.js';

export class Issues extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            cards: [],
            columns: [],
            project_id: this.props.location.state.project_id,
            canAddIssue: false,
            participantList: [],
            assigned_issues: [],
            unassigned_issues: []
        }
    }
    componentDidMount() {
        // gather project participants
        const project_users_url = "/project/" + this.state.project_id + "/all_users";
        authHeader();
        axios.get(project_users_url, { headers: authHeader() }).then((response) => {
            const all_users_list = response.data.participants;
            this.setState({
                participantList: all_users_list
            });
        });

        const project_id = this.state.project_id;
        const issues_url = "/project/" + project_id + "/issue/list";
        const requesting_project_id = this.props.location.state.project_id;
        const header_object = authHeader();
        header_object["project_id"] = requesting_project_id;
        axios.get(issues_url, { headers: header_object }).then((response) => {
            const unformatted_issue_list = response.data.issues;
            const card_list = unformatted_issue_list.map((unformatted_issue) => ({
                id: unformatted_issue.ID,
                title: unformatted_issue.name
            }));
            const column_list = ['Sub-Task', 'Bug', 'Epic', 'Improvement', 'New Feature', 'Story', 'Task'].map( function(title, i) {
                return {id: i,
                title,
                cardIds: get_issues_array(unformatted_issue_list, i)}
            });
            console.log(column_list);
            this.setState({
                cards: card_list,
                columns: column_list
            });
        });

        // gather unassigned issues of this project
        const unassigned_issue_url = "/project/" + project_id + "/issue/unassigned_list";
        authHeader();
        axios.get(unassigned_issue_url, { headers: authHeader() }).then((response) => {
            const issue_list = response.data.issues;
            this.setState({
                unassigned_issues: issue_list
            });
        });
    }

    addIssue = () => {
        this.setState({
            canAddIssue: true
        });
    }

    handleClose = () => {
        this.setState({
            canAddIssue: false
        })
    }

    moveCard = (cardId, destColumnId, index) => {
        this.setState(state => ({
            columns: state.columns.map(column => ({
                ...column,
                cardIds: _.flowRight(
                    // 2) If this is the destination column, insert the cardId.
                    ids =>
                        column.id === destColumnId
                            ? [...ids.slice(0, index), cardId, ...ids.slice(index)]
                            : ids,
                    // 1) Remove the cardId for all columns
                    ids => ids.filter(id => id !== cardId)
                )(column.cardIds),
            })),
        }));
    };
    render() {
        return (
            <div className="col-sm-12">
                <h1>Issues for: {this.props.location.state.project_name}</h1>
                <DndProvider backend={HTML5Backend}>
                    <Board
                        cards={this.state.cards}
                        columns={this.state.columns}
                        moveCard={this.moveCard}
                        projectID={this.state.project_id}
                    />
                </DndProvider>
                <Button variant="warning" onClick={this.addIssue} style={{ marginLeft: "50%", marginTop: "10px" }}>Add Issue</Button>
                <Modal show={this.state.canAddIssue} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Fill details for new issue</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <Formik
                                initialValues={{
                                    issueName: '',
                                    issueDesc: ''
                                }}
                                validationSchema={Yup.object().shape({
                                    issueName: Yup.string().required('Issue name is required'),
                                    issueDesc: Yup.string().required('Issue description is required'),
                                    assignedTo: Yup.string(),
                                    taskType: Yup.string()
                                })}
                                onSubmit={({ issueName, issueDesc, assignedTo, taskType }, { setStatus, setSubmitting }) => {
                                    setStatus();
                                    const project_id = this.state.project_id;
                                    if (!assignedTo) { assignedTo = 0; }
                                    taskType = Number(taskType);
                                    assignedTo = Number(assignedTo);
                                    if (isNaN(taskType)) {
                                        taskType = 0;
                                    }
                                    const requestOptions = {
                                        "name": issueName,
                                        "desc": issueDesc,
                                        "assigned_to": assignedTo,
                                        "task_type": taskType
                                    };
                                    console.log(requestOptions);
                                    createIssue(requestOptions, project_id).then(
                                        issue => {
                                            if (issue.assigned_to === 0) {
                                                var unassigned_list = this.state.unassigned_issues;
                                                unassigned_list.push(issue);
                                                this.setState({
                                                    unassigned_issues: unassigned_list
                                                });
                                            }
                                            else {
                                                const this_user_id = this.state.currentUser.ID;
                                                if (issue.assigned_to === this_user_id) {
                                                    var old_card_list = this.state.cards;
                                                    // var old_column_list = this.state.columns;
                                                    old_card_list.push({ id: issue.ID, title: issue.name })
                                                    this.setState({cards: old_card_list});
                                                }
                                            }
                                        },
                                        error => {
                                            setStatus(error);
                                        }
                                    );
                                    this.setState({canAddIssue: false});
                                    setSubmitting(false);

                                }}
                                render={({ errors, status, touched, isSubmitting }) => (
                                    <Form>
                                        <div className="form-group">
                                            <label htmlFor="issueName">Issue Name</label>
                                            <Field name="issueName" type="text" className={'form-control' + (errors.issueName && touched.issueName ? ' is-invalid' : '')} />
                                            <ErrorMessage name="issueName" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="issueDesc">Issue Description</label>
                                            <Field name="issueDesc" type="text" className={'form-control' + (errors.issueDesc && touched.issueDesc ? ' is-invalid' : '')} />
                                            <ErrorMessage name="issueDesc" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="assignedTo">Choose User to be Assigned to</label>
                                            <Field id="assigned_to_field" name="assignedTo" component="select" className={'form-control' + (errors.assignedTo && touched.assignedTo ? ' is-invalid' : '')}>
                                                <option value="0">None</option>
                                                {this.state.participantList.map((participant) => {
                                                    return <option value={participant.ID}>{participant.username}</option>
                                                })}
                                            </Field>
                                            <ErrorMessage name="assignedTo" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="taskType">Choose Issue Type</label>
                                            <Field name="taskType" component="select" className={'form-control' + (errors.taskType && touched.taskType ? ' is-invalid' : '')}>
                                                {
                                                    ['Sub-Task', 'Bug', 'Epic', 'Improvement', 'New Feature', 'Story', 'Task'].map((title, i) => {
                                                        return <option value={i}>{title}</option>
                                                    })
                                                }
                                            </Field>
                                            <ErrorMessage name="assignedTo" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Confirm issue Details</button>
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
                    </Modal.Body>
                </Modal>
                <ul className="list-group" style={{ marginTop: "30px" }}>
                    {
                        this.state.unassigned_issues.map((issue) => {
                            return <li className="list-group-item" key={issue.ID} >{issue.name}<Button variant="success"  style={{ float: "right" }} onClick={() => {
                                AssignIssue(issue).then(
                                    ok => {
                                        var unassignedIssueList = this.state.unassigned_issues;
                                        unassignedIssueList = unassignedIssueList.filter((unassigned_issue) => {
                                            return (unassigned_issue.ID === issue.ID);
                                        });
                                        var curr_issue_list = this.state.assigned_issues;
                                        curr_issue_list.push(issue);
                                        console.log(curr_issue_list);
                                        this.setState({
                                            assigned_issues: curr_issue_list,
                                            unassigned_issues: unassignedIssueList
                                        });
                                    },
                                    error => {console.error(error);}
                                );
                            }}>Assign To Me</Button></li>
                        })
                    }
                </ul>
            </div>
        )
    }
}
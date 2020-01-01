import React, { Component } from 'react';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';

import '../index.css';

import { authenticationService } from '../services/authentication.service';
import { authHeader } from '../auth-header';
import { Board } from './Board';

function get_issues_array(unformatted_issue_list, i) {
    var temp_array = [];
    unformatted_issue_list.forEach((issue) => {
        if (issue.ID === i) {
            temp_array.push(issue.ID);
        }
    });
    return temp_array;
}

export class Issues extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            cards: [],
            columns: []
        }
    }
    componentDidMount() {
        const issues_url = "/issues/all";
        const requesting_project_id = this.props.location.state.project_id;
        const header_object = authHeader();
        header_object["project_id"] = requesting_project_id;
        axios.get(issues_url, { headers: header_object }).then((response) => {
            const unformatted_issue_list = response.data.issues;
            const card_list = unformatted_issue_list.map((unformatted_issue) => ({
                id: unformatted_issue.ID,
                title: unformatted_issue.issueName
            }));
            const column_list = ['Backlog', 'Waiting', 'Doing', 'In Review', 'Done'].map((title, i) => ({
                id: i,
                title,
                cardIds: get_issues_array(unformatted_issue_list, i),
            }));
            this.setState({
                cards: card_list,
                columns: column_list
            });
        });
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
            <div class="col-sm-12">
                <h1>Issues for {this.props.location.state.project_name}</h1>
                <DndProvider backend={HTML5Backend}>
                    <Board
                        cards={this.state.cards}
                        columns={this.state.columns}
                        moveCard={this.moveCard}
                    />
                </DndProvider>
            </div>
        )
    }
}
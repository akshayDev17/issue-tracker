import React from 'react';
import axios from 'axios';

import { authenticationService } from '../services/authentication.service';
import {authHeader} from '../auth-header';

export class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue
        };
    }

    componentDidMount() {
        const project_url = "/projects/all";
        console.log(authHeader());
        axios.get(project_url, {headers: authHeader()}).then( (response) => {
            const projects_array = response.data.projects;
            var main_list = document.getElementById("all_projects");
            projects_array.forEach((project) => {
                var li_tag = document.createElement("li");
                li_tag.classList.add("list-group-item");
                var text = document.createTextNode(project.projectName);
                li_tag.appendChild(text);
                main_list.appendChild(li_tag);
            });
        });
    }

    render() {
        const { currentUser } = this.state;
        return (
            <div>
                <h1>Hi {currentUser.username}!</h1>
                <p>You're logged in with React & JWT!!</p>
                <h3>Users from secure api end point:</h3>
                <ul id="all_projects" className="list-group"></ul>
            </div>
        );
    }
}

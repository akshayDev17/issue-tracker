import axios from 'axios';

import { authHeader } from '../helpers/auth-header';
import {handleCreateIssueResponse} from './handleResponse';

export function createIssue(requestOptions, project_id) {

    const add_issue_url = "/project/"+project_id+"/issue/new";
    return axios.post(add_issue_url, requestOptions, { headers: authHeader() }).then(handleCreateIssueResponse).then((issue) => {
        // check if issue was successfully created
        if(issue) {
            return issue;
        }
    });
}
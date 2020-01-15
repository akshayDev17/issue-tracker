import axios from 'axios';

import { handleAssignIssueResponse } from './handleResponse';
import { authHeader } from '../helpers/auth-header';

export function AssignIssue(issue) {

    const assign_user_url = "/project/" + issue.project_id + "/issue/" + issue.ID + "/assign_to_me";
    return axios.post(assign_user_url, {}, { headers: authHeader() }).then(handleAssignIssueResponse);

}
import {authenticationService} from './authentication.service';

export function handleResponse(response) {
    var text = JSON.stringify(response);
    const data = text && JSON.parse(text);
    
    if (!response.data.status) {
        if ([401, 403].indexOf(response.status) !== -1) {
            // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
            authenticationService.logout();
            this.props.location.reload(true);
        }
        const error = (data && data.message) || response.data.message;
        return Promise.reject(error);
    }

    return data;
}

export function handleCreateIssueResponse(response) {
    if(!response.data.status) {
        const error = response.data.message;
        return Promise.reject(error);
    }
    const data = response.data.issue;
    return data;
}

export function handleAssignIssueResponse(response) {
    if(!response.data.status) {
        const error = response.data.message;
        return Promise.reject(error);
    }
    return true;
}

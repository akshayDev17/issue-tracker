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

        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }

    return data;
}

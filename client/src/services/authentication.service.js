import { BehaviorSubject } from 'rxjs';
import axios from 'axios';

import { handleResponse } from './handleResponse';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() { return currentUserSubject.value }
};

function login(username, password) {
    const requestOptions = {
        "username": username,
        "password": password
    };

    // const AuthStr = '"Abid" eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjN9.pPPqcjJdQc_t2JWc7qtvJPziU3B36LgSM9vZYcpxNac';
    const url = '/login';

    return axios.post(url, requestOptions).then(handleResponse).then(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        if(user){
            user.token = user.data.account.token;
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUserSubject.next(user);

        return user;
    });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
}

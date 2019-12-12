import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import LoginComponent from './login.js';
import RegComponent from './register.js';
import * as serviceWorker from './serviceWorker';


class Root extends React.Component {
    render() {
        return (
            <Router>
                <button><Link to="/login">LOGIN</Link></button>
                <button><Link to="/register">REGISTER</Link></button>

                <Route path="/login" ><LoginComponent /></Route>
                <Route path="/register"><RegComponent /></Route>
            </Router>
        );
    }
}
ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

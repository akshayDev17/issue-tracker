import React from 'react';
import { Router, Link, Route } from 'react-router-dom';

import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { history } from './History';
import { authenticationService } from '../services/authentication.service';
import { PrivateRoute } from './PrivateRoute';
import { HomePage } from './HomePage';
import { Issues } from './Issues';

export class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentUser: null
    };
  }

  componentDidMount() {
    authenticationService.currentUser.subscribe(x => this.setState({ currentUser: x }));
  }

  logout() {
    authenticationService.logout();
    history.push('/login');
  }

  render() {
    const { currentUser } = this.state;
    return (
      <Router history={history}>
        <div>
          {currentUser &&
            <nav className="navbar navbar-expand navbar-dark bg-dark">
              <div className="navbar-nav">
                <Link to="/" className="nav-item nav-link">Home</Link>
                <a onClick={this.logout} href="#" className="nav-item nav-link">Logout</a>
              </div>
            </nav>
          }
          <div className="jumbotron">
            <div className="container">
              <PrivateRoute exact path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/signup" component={SignUpPage} />
              <Route path="/issues" component={Issues} />
            </div>
          </div>
        </div>
      </Router>
    );
  }

}

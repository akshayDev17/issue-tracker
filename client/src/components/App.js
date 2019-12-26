import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
import _ from 'lodash';

import Final from './views/Board/Final.js';
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer";

class App extends Component {
  
  render() {
    return (
      <div>
        <NavBar />
     
        <div style={{ paddingTop: '75px', minHeight: 'calc(100vh - 80px)' }}>
        
          <Switch>
            <Route exact path="/" component={Auth(LandingPage, null)} />
            <Route exact path="/login" component={Auth(LoginPage, true)} />
            <Route exact path="/register" component={Auth(RegisterPage, true)} />
            <Route exact path="/board" component={Auth(Final, true, true)} />
          </Switch>
    
        </div>
        <Footer />
        </div>
    );
  }
}

export default App;

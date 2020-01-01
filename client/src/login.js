import React from 'react';
import './login_page.css';
import axios from 'axios';


class LoginComponent extends React.Component{
    changeBodyClass(){
        document.body.className="login_bg";
    }
    makePostLoginRequest() {
        axios.post("http://localhost:12345/");
        console.log("login post request");
    }
    render() {
        return (
            <div className="container">
            <button onClick={this.makePostLoginRequest}>POST</button>
                <section id="content">
                    <h1>Login</h1>
                    <form>
                        <div className="wrapper">
                            <i className="fa fa-user"></i>
                            <input type="text" placeholder="Username..." id='username' name="username" required/>
                        </div>
                        <div className="wrapper">
                            <i className="fa fa-lock"></i>
                            <input type="password" placeholder="Password..." id='password' name="password" required/>
                        </div>
                        <div class="LoginSubmit">
                            <input type="submit" value="Login" id='login' onClick={this.makePostLoginRequest}/>
                        </div>
                        <div style={{height: "50px"}}>
                            <a style={{float:"right"}}>Forgot Password?</a>
                            <a href="/register" style={{float: "left"}}>Not a user? Sign-up here.</a>
                        </div>
                        <div className="external_login_request">
                            <span>Or login using</span>
                        </div>
                        <div className="external_login">
                            <a className="login_item bg1">
                            <i className="fa fa-facebook"></i>
                            </a>
                            <a>
                            <i className="fa fa-github ghub_btn" ></i>
                            </a>
                            <a className="login_item bg3">
                            <i className="fa fa-google"></i>
                            </a>
                        </div>
                    </form>
                </section>
            </div>
        );
    }
}

export default LoginComponent;
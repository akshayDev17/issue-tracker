import React from 'react';
import './reg.css';
import avatar_image from './images/avatar.jpeg';

class RegComponent extends React.Component{
    //document.getElementById('root').className='reg_bg';
    render() {
        return (
            <div className="regbox">
                <img src={avatar_image} className="avatar" alt="Avatar"/>
                <h1>Sign up here</h1>
                <p>Username</p>
                <form method="POST">
                    <input type="text" name="username" placeholder="Enter username..." required />
                    <p>Email</p>
                    <input type="email" name="email" placeholder="Enter email address" required />
                    <p>Password</p>
                    <input type="password" name="pass1" placeholder="Enter password" required />
                    <p style={{ marginTop : "5px"}}>Re-Enter password to confirm</p>
                    <input type="password" name="pass2" placeholder="Enter password again" required />
                    <input type="submit" name="" value="Sign up" />
                </form>
            </div>
        );
    }
}

export default RegComponent;
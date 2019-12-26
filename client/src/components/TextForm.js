import React, { Component } from 'react';
import axios from 'axios';

export class TextForm extends Component {
  onSubmit = event => {
    const form = event.target;
    event.preventDefault();
    const AuthStr = '"Abid" eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjN9.pPPqcjJdQc_t2JWc7qtvJPziU3B36LgSM9vZYcpxNac';
    const url = '/';

    axios.post(url,{a: 10}, {headers: {"Authorization":AuthStr } }).then(resp => {
      console.log(resp)
    });
    this.props.onSubmit(form.input.value);
    form.reset();
  };

  render() {
    return (
      <form onSubmit={this.onSubmit} ref={node => (this.form = node)}>
        <input
          type="text"
          className="TextForm__input"
          name="input"
          placeholder={this.props.placeholder}
        />
      </form>
    );
  }
}

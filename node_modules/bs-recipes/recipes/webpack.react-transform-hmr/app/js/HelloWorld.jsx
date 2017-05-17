import React, { Component } from 'react';

export default class HelloWorld extends Component {
  render() {
    // Play with it...
    const name = 'World';

    return (
      <h2 className="hello-world">
        <span className="hello-world__i">Hello, {name}</span>
      </h2>
    );
  }
}

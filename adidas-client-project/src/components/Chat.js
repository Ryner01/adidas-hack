import React, { Component } from 'react'
import { MessagesList } from "../containers/MessagesList"
import { AddMessage } from "../containers/AddMessage"

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animate: false,
    };
  }

  componentDidMount() {
    this.onWillOpen();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.animate === false) {
      this.onWillOpen();
    }
    else if (this.state.animate === true && this.props.selectedUser !== nextProps.selectedUser) {
      this.setState({ animate: false });
      this.onWillOpen();
    }
  }

  onWillOpen = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.setState({ animate: true });
      }, 200);
    });
  }

  render() {
    return (
      <div className={`chat ${ this.state.animate ? 'animate' : ''}`}>
        <MessagesList />
        <AddMessage />
      </div>
    );
  }
}

export default Chat

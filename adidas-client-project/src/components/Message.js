import React, { Component } from 'react'
import PropTypes from "prop-types"

const MessageAvatar = (props) => {
  return (
    <div className="chat-avatar">
      <img src={props.profile_pic ? props.profile_pic : "http://i.pravatar.cc/45"} alt=""/>
    </div>
  )
}
const MessageBot = () => {
  return (
    <div className="chat-avatar chat-avatar--bot">
    </div>
  )
}

class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animate: false,
    };
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.setState({ animate: true });
    });
  }

  render() {
    return (
      <div
        className={`message ${ this.props.type === 'system' ? 'message--right' : 'message--left'} ${ this.state.animate ? 'animate' : ''}`}
      >

        {this.props.type === 'user'
          ? <MessageAvatar {...this.props} />
          : null
        }
        {this.props.image
          ? (
            <div className="chat-bubble chat-image">
              <img src={this.props.image} alt=""/>
              {this.props.content
                ? (
                  <div className="chat-image__text">
                    {this.props.content}
                  </div>
                )
                : null
              }
            </div>
          )
          : (
            <div className="chat-bubble">
              {this.props.content}
            </div>
          )
        }
        {this.props.type === 'system'
          ? (
            this.props.human
              ? <MessageAvatar {...this.props} />
              : <MessageBot />
          )
          : null
        }
      </div>
    )
  }
}

Message.propTypes = {
  content: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string.isRequired
}

export default Message
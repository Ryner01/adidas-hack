import React from 'react'
import PropTypes from 'prop-types'
import Message from './Message'

const MessagesList = ({ messages, user }) => (
  <div className="messages-list">
    <div className="messages-list__content">
      { !messages.length
        ? <div className="heading empty">No messages</div>
        :
          messages.map(message => (
            <Message
              key={message.id}
              {...message}
              {...user}
            />
          ))
      }
    </div>
  </div>
)

MessagesList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.isRequired,
    content: PropTypes.string,
    type: PropTypes.string.isRequired
  }).isRequired).isRequired
}

export default MessagesList

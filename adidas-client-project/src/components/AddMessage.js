import React from 'react'
import PropTypes from 'prop-types'
import plus from '../plus.svg'

const AddMessage = (props) => {
  let input

  return (
    <div id="new-message" className="add-message">
      <div className="add-message__plus">
        <img src={plus} alt=""/>
      </div>
      <input
        className="add-message__input"
        placeholder="Type your response"
        type="text"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && input.value) {
            const message = {
              content: input.value,
              type: 'system',
              human: true,
              userId: props.selectedUser
            }
            props.dispatch(message)
            input.value = ''
          }
        }}
        ref={(node) => {
        input = node
      }}
      />
    </div>
  )
}

AddMessage.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default AddMessage
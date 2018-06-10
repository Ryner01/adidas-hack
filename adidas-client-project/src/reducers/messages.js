import * as types from '../constants/ActionTypes';

const messages = (state = [], action) => {
  switch (action.type) {

    case types.MESSAGES_LIST:
      return action.messages;

    case 'MESSAGE_ADD':
    case 'MESSAGE_RECEIVED':
      return state.concat([
        {
          content: action.message.content,
          image: action.message.image,
          type: action.message.type,
          userId: action.message.userId,
          id: action.id
        }
      ])

    default:
      return state
  }
}

export default messages

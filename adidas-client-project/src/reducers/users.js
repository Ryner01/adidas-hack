import * as types from '../constants/ActionTypes'

const users = (state = [], action) => {
  switch (action.type) {

    case types.USERS_LIST:

      [...action.users].forEach(user => {
        if(!user.profile_pic) {
          user.profile_pic = 'http://i.pravatar.cc/100'
        }
      })

      return action.users;

    case types.USERS_ADD:
      return state.concat(action.user)

    case types.USER_UPDATE_STATUS:

      [...state].forEach(user => {
        if(user.id === action.user.id) {
          user.status = action.user.status
        }
      })

      return state


    case types.MESSAGE_ADD:

      [...state].forEach(user => {
        if(user.id === action.message.userId) {
          user.messages = user.messages.concat(action.message)
        }
      })

      return state

    default:
      return state
  }
}

export default users

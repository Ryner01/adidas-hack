import * as types from '../constants/ActionTypes'

const selectedUser = (state = [], action) => {
  switch (action.type) {
    case types.SET_SELECTED_USER:
      return action.userId
    default:
      return state
  }
}

export default selectedUser

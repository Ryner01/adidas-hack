import * as types from '../constants/ActionTypes'

let nextMessageId = 0

export const addMessage = (message) => ({
  type: types.MESSAGE_ADD,
  id: nextMessageId++,
  message
})


export const populateMessagesList = messages => {

  // if message has no id
  messages.map((message) => {
    if(!message.id) {
      message.id =  nextMessageId++
    }
    return message
  })

  return ({
    type: types.MESSAGES_LIST,
    messages
  })
}

export const populateUsersList = users => ({
  type: types.USERS_LIST,
  users
})

export const usersAdd = (user) => ({
  type: types.USERS_ADD,
  user
})

export const userUpdateStatus = (user) => ({
  type: types.USER_UPDATE_STATUS,
  user
})

export const setSelectedUser = userId => ({
  type: types.SET_SELECTED_USER,
  userId
})

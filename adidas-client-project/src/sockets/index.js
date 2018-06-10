import {
  addMessage,
  populateUsersList,
  populateMessagesList,
  setSelectedUser,
  usersAdd,
  userUpdateStatus
} from '../actions'

import openSocket from 'socket.io-client';

const setupSocket = (dispatch) => {

  // test server
  // const socket = openSocket('http://localhost:8000');

  // prod server
  const socket = openSocket('https://9chat.9roads.red/');

  // get users
  socket.on('users-list', usersList => {

    console.log('usersList: ', usersList)

    // Add fake users
    const fakeUsers = [...Array(8)].map((x, i) => {
      return {
        id: 'id'+i,
        name: i%4 ? 'Jane Doe '+i : 'John Doe '+i,
        full_name: i%4 ? 'Jane Doe '+i : 'John Doe '+i,
        age: i%4 ? '27' : '24',
        gender: i%4 ? 'Woman' : 'Man ',
        status: i%2 ? 'active' : 'inactive',
        profile_pic: 'http://i.pravatar.cc/100',
        messages: i < 3 ? [] : [{
          id: 2,
          type: 'user',
          content: i%3 ? 'I love the Disrupt, man!' : 'The UltraBOOST are awesome!',
        }]
      }
    })
    usersList = usersList.concat(fakeUsers)

    // if users
    if(usersList.length) {

      // default users list
      dispatch(populateUsersList(usersList))

      // default selected user is the first one
      let defaultSelectedUser = usersList[0];

      // get first user who requires attention
      const usersAttention = usersList
        .filter(function(user){ return user.status === 'requires_attention' })

      if(usersAttention.length) {
        defaultSelectedUser = usersAttention[0];
      }

      // select user
      dispatch(setSelectedUser(defaultSelectedUser.id))

      // update messages
      dispatch(populateMessagesList(defaultSelectedUser.messages))
    }
  })

  // on add user
  socket.on('users-add', user => {
    dispatch(usersAdd(user))
  })

  // on user change status
  socket.on('user-change-status', user => {
    dispatch(userUpdateStatus(user))
  })

  // on new message
  socket.on('new-message', message => {
    console.log('message: ', message)
    dispatch(addMessage(message))
  })
}

export default setupSocket

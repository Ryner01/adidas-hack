import { combineReducers } from 'redux'
import messages from './messages'
import users from './users'
import selectedUser from './selectedUser'

const AppReducers = combineReducers({
  messages,
  users,
  selectedUser
})

export default AppReducers

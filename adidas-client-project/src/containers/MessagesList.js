import { connect } from 'react-redux'
import MessagesListComponent from '../components/MessagesList'

function mapStateToProps(state, ownProps) {

  let selectedUsers = state.users.filter((user) => user.id == state.selectedUser)
  const user = selectedUsers[0]

  return {
    user: user,
    messages: state.messages
  }
}

export const MessagesList = connect(mapStateToProps)(MessagesListComponent)

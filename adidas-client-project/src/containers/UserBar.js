import { connect } from 'react-redux'
import UserBarComponent from '../components/UserBar'

function mapStateToProps(state, ownProps) {

  let selectedUsers = state.users.filter((user) => user.id == state.selectedUser)
  const user = selectedUsers[0]

  return { user: user }
}

export const UserBar = connect(mapStateToProps)(UserBarComponent)

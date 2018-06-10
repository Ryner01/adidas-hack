import { connect } from 'react-redux'
import UserLinkComponent from '../components/UserLink'
import {populateMessagesList, setSelectedUser} from '../actions'

const mapDispatchToProps = (dispatch) => ({
  dispatch: (userId, users) => {

    // id int or string
    let user = users.filter((user) => user.id == userId)


    if(user.length) {
      user = user[0]
      dispatch(setSelectedUser(user.id))
      dispatch(populateMessagesList(user.messages))
    }
  }
})

export const UserLink = connect(state => ({
  users: state.users,
  selectedUser: state.selectedUser
}), mapDispatchToProps)(UserLinkComponent)

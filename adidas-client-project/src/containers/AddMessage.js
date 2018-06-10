import { connect } from 'react-redux'
import AddMessageComponent from '../components/AddMessage'
import openSocket from 'socket.io-client'
// import { addMessage } from '../actions'


const mapDispatchToProps = dispatch => ({
  dispatch: (message) => {

    // no need to addMessage manually, server reply with the new message
    // dispatch(addMessage(message))

    // test server
    // const socket = openSocket('http://localhost:8000')

    // prod server
    const socket = openSocket('https://9chat.9roads.red/');

    socket.emit('message', message)
  }
})

export const AddMessage = connect((state) => ({
  selectedUser: state.selectedUser
}), mapDispatchToProps)(AddMessageComponent)

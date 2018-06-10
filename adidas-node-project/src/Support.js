import { users } from './User'

export let supportClients = []

export function addSupportClient(socket) {
    supportClients.push(new SupportClient(socket))
}

export class SupportClient {

    constructor(socket) {
        this.socket = socket
        
        this.socket.emit('users-list', users.map((user) => user.toJson()))
        this.socket.on('message', function (data) {
            let user = users.find((item) => item.id === data.userId)
            user.sendToChatBot = false
            user.newSystemMessage(data.content)
        })
    }

    static addUserEvent(user) {
        for (let client of supportClients) {
            client.socket.emit('users-add', user.toJson())
        }
    }

    static changeUserStatusEvent(user) {
        for (let client of supportClients) {
            client.socket.emit('user-change-status', { id: user.id, status: user.status })
        }
    }

    static newMessage(msg, user) {
        for (let client of supportClients) {
            if (msg.image) {
                client.socket.emit('new-message', { userId: user.id, type: msg.type, content: msg.content, image: msg.image })
            } else {
                client.socket.emit('new-message', { userId: user.id, type: msg.type, content: msg.content })
            }
        }
    }
}
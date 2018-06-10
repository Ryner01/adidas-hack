

export function fetchInstagramPhotos(user) {
    user.chatbot.sendEventToChatBot('instagram_update', {
        color: 'red',
        location: 'city',
        gender: 'men'
    })
}
const User = require('./User')
let productsList = require('../products.json')

export function findUserBySession(session) {
    let user = User.users.find((item) => item.chatbot.sessionPath === session)
    return user
}

export function deleteUser(user) {
    users.splice(user, 1)
}

export function filterProducts(filterOptions) {
    console.log(filterOptions)
    let products = productsList.filter((item) => {
        let bool = false
        if (item.color === filterOptions.color && item.location === filterOptions.location && item.duration === filterOptions.RunDuration && item.gender === filterOptions.gender) {
            
            bool = true
        }

        return bool
    })

    products = products.sort((a, b) => a.price > b.price)

    return products
}


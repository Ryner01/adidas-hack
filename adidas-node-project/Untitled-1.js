let productsList = require('./products.json')
let context = {
    gender: 'men',
    color: 'black',
    RunDuration: 'long',
    location: 'city',
    foot_size: 9
}


function filterProducts(filterOptions) {
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

filterProducts(context)


let obj = [{ name: 'projects/adidas-hack-206511/agent/sessions/S1g9au5em/contexts/question_set', parameters: {'ahoj': 'sd'} }, { name: 'projects/adidas-hack-206511/agent/sessions/S1g9au5em/contexts/other', parameters: {} }]

console.log(obj.find((item) => item.name.includes('question_set')).parameters)

let express = require('express');
const app = express()
let server = app.listen(5000);
let io = require('socket.io')(server);
const readline = require('readline');
const bodyParser = require('body-parser')
const path = require('path')

import { User, users } from './User'
import { fetchInstagramPhotos } from './instagram'
import { addSupportClient } from './Support'
import { findUserBySession, filterProducts } from './util'

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/webhook', (req, res) => {
    console.log('webhook called')
    let user = findUserBySession(req.body.session)

    function instagramYesEvent() {
        console.log('insta yes')

        res.setHeader('Content-Type', 'application/json');
        res.send({ fulfillmentText: '... gimme a moment :-)' });

        // async dont execute
        fetchInstagramPhotos(user)
    }

    function listProduct() {

        let context = req.body.queryResult.outputContexts.find((item) => item.name.includes('question_set')).parameters

        let products = filterProducts(context)

        res.setHeader('Content-Type', 'application/json');
        res.send({fulfillmentText: 'Great! Thank you, I think these 3 are the best picks for you. Which one do you want? :-)'});

        let sliced = products.slice(-3)
        user.sendProducts(sliced)
    }

    function pricePicker() {

        let context = req.body.queryResult.outputContexts.find((item) => item.name.includes('question_set')).parameters
        let products = filterProducts(context)

        res.setHeader('Content-Type', 'application/json');
        if (context.price_filter) {
            res.send({ fulfillmentText: 'This one is similar. Do you like it?' });
        } else {
            res.send({ fulfillmentText: 'Great choice! I own pair of those too, and they feel awesome!' });
        }

        let sliced = [products[0]]
        user.sendProducts(sliced)
    }

    function endBot() {
        user.endBot()
        res.send({ fulfillmentText: 'Oh ok, give me a moment, my friend can make this happen! :)' });
    }

    if (req.body.queryResult.action === 'agreement.agreement-yes') {
        instagramYesEvent()
    } else if (req.body.queryResult.action === 'product-picker') {
        listProduct()
    } else if (req.body.queryResult.action === 'price-picker') {
        pricePicker()
    } else if (req.body.queryResult.action === 'end-bot') {
        endBot()
    }
})

app.post('/instagram-message', (req, res) => {

    let data = req.body
    let user = users.find((item) => item.instagramId === data.userId)
    if (user) {
        user.newUserMessage(data.text)
    } else {
        user = new User(data.userId)
        user.newUserMessage(data.text)
    }
    res.send(200)
})

io.on('connection', function (socket) {
    addSupportClient(socket)
});

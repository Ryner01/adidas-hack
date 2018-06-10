const shortid = require('shortid');
import ChatBot from './Chatbot.js'
import { SupportClient } from './Support'
const request = require('request-promise-native');
const ProfileScrape = require('./ProfileScrape.js')


const INSTAGRAM_BASE_URL = 'https://instagram-api.9roads.red'

export let users = []

export class User {

    constructor(instagramId) {
        this.sendToChatBot = true
        this.id = shortid.generate()
        this.msgList = []
        this.status = 'active'
        this.chatbot = new ChatBot(this, this.id)
        this.name = 'testname1'
        this.msgId = 0
        let data = ProfileScrape.analyzeProfile()

        this.gender = data.gender
        this.age = data.age
        this.username = data.username
        this.full_name = data.full_name
        this.profile_pic = data.profile_pic

        this.instagramProfile = {
            handle: 'rynner'
        }

        this.instagramId = instagramId

        users.push(this)
        SupportClient.addUserEvent(this)
    }

    newUserMessage(text) {
        return new Promise(async resolve => {
            let msg = this._createMsg('user', text, this.id)
            this.msgList.push(msg)
            SupportClient.newMessage(msg, this)
            if (this.sendToChatBot) {
                await this.chatbot.sendToChatBot('text', msg)
                resolve()
            }
        })
    }

    newSystemMessage(text, human=false) {

        let msg;
        if (human) {
            msg = this._createMsg('system', text, this.id, human)
        } else {
            msg = this._createMsg('system', text, this.id)
        }

        this.msgList.push(msg)
        SupportClient.newMessage(msg, this)
        this.sendToInstagram(msg)
    }

    sendProducts(products) {
        for (let product of products) {
            console.log('sent product')
            this.sendProductToInstagram(product)
            this.sendProductToDashbord(product)
        }
    }

    sendToInstagram(msg) {
        return new Promise(async resolve => {
            let options = {
                method: 'GET',
                qs: { userId: this.instagramId, text: msg.content },
            };

            try {
                await request(`${INSTAGRAM_BASE_URL}/send-message`, options)
                resolve()
            } catch (error) {
                //console.error(error)
            }
        })
    }

    sendProductToInstagram(product) {
        return new Promise(async resolve => {
            console.log(product.img_url)
            let options = {
                method: 'GET',
                qs: { userId: this.instagramId, text: product.name, imageUrl: product.img_url }
            };

            try {
                await request(`${INSTAGRAM_BASE_URL}/send-image`, options)
                resolve()
            } catch (error) {
                //console.error(error)
            }
        })
    }

    sendProductToDashbord(product) {
        let msg = this._createMsg('system', product.name, this.id, false)
        msg.image = product.img_url
        this.msgList.push(msg)
        SupportClient.newMessage(msg, this)
    }

    changeTyping(bool) {
        return new Promise(async resolve => {
            let options = {
                method: 'GET',
                qs: { userId: this.instagramId, flag: bool },
            };

            try {
                await request(`${INSTAGRAM_BASE_URL}/set-typing`, options)
                resolve()
            } catch (error) {
                console.error(error)
            }            
        })
    }

    endBot() {
        this.sendToChatBot = false
        this.status = 'requires_attention'
        SupportClient.changeUserStatusEvent(this)
    }

    _createMsg(type, text, user, human=false) {
        this.msgId = this.msgId++
        return {
            type: type,
            content: text,
            user: user,
            id: this.msgId,
            human: human
        }
    }

    toJson() {
        let msgs = this.msgList.map((item) => {
            return {
                content: item.content,
                type: item.type,
                id: item.id,
                human: item.human
            }
        })

        return {
            id: this.id,
            instagramId: this.instagramId,
            messages: msgs,
            status: this.status,
            name: this.name,
            gender: this.gender,
            age: this.age,
            username: this.username,
            full_name: this.full_name,
            profile_pic: this.profile_pic
        }
    }
}

const dialogflow = require('dialogflow');
const structjson = require('./structjson.js');

const projectId = 'adidas-hack-206511';

export default class ChatBot {
    constructor(user, userId) {
        this.languageCode = 'en-US'
        this.sessionClient = new dialogflow.SessionsClient();
        this.sessionPath = this.sessionClient.sessionPath(projectId, userId);
        this.user = user
    }

    async sendToChatBot(type, msg) {
        return new Promise(async resolve => {
            let request = this.createTextMsg(msg.content)
            let response = await this.send(request)

            this.user.newSystemMessage(response)
            resolve()
        })
    }

    async sendEventToChatBot(name, params) {
        let request = this.createEvent(name, params)
        let response = await this.send(request)
        this.user.newSystemMessage(response)
    }


    createTextMsg(text) {
        let request = {
            session: this.sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: this.languageCode,
                },
            },
        }
        return request
    }

    createEvent(name, params) {
        let request = {
            session: this.sessionPath,
            queryInput: {
                event: {
                    name: name,
                    parameters: structjson.jsonToStructProto(params),
                    languageCode: this.languageCode
                }
            }
        };

        return request
    }

    async send(request) {
        this.user.changeTyping(true)
        return new Promise(resolve => {
            this.sessionClient
                .detectIntent(request)
                .then(async responses => {
                    const result = responses[0].queryResult;
                    this.user.changeTyping(false)
                    resolve(result.fulfillmentText)
                })
                .catch(err => {
                    console.error(err)
                    console.log('ERROR: happened');
                });
        })
    }
}
'use strict'

const config = require('config')
const { server } = require('./index')


exports.run = async () => {
    // Run the app server
    server.listen(config.get('service.port'), async () => {
        console.log(`${server.name} listening at ${server.url}`)
    })
}

exports.close = async () => server.close()

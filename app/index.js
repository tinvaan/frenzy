'use strict'

const restify = require('restify')
const router = require('./routes')
const server = restify.createServer()


// Initialize app routes
router.applyRoutes(server)

// Run the app server
server.listen(8080, () => {
    console.log(`${server.name} listening at ${server.url}`)
})

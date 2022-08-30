'use strict'

const restify = require('restify')
const router = require('./routes')

const server = restify.createServer()
server.pre(restify.plugins.pre.dedupeSlashes())


// Initialize app routes
router.applyRoutes(server)

// Run the app server
server.listen(3000, () => {
    console.log(`${server.name} listening at ${server.url}`)
})

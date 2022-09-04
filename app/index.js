'use strict'

const restify = require('restify')
const router = require('./routes')

const server = restify.createServer({ name: 'frenzy', ignoreTrailingSlash: true })


// Initialize pre-routing plugins
server.pre(restify.plugins.pre.dedupeSlashes())

// Initialize server plugins
server.use(restify.plugins.jsonp())
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser())
server.use(restify.plugins.jsonBodyParser())

// Initialize app routes
router.applyRoutes(server)

// Run the app server
server.listen(3000, async () => {
    console.log(`${server.name} listening at ${server.url}`)
})

// Log requests and responses to console
server.pre((req, res, next) => {
    console.log(`\n>>> ${res.statusCode} ${req.method} ${req.url}`)
    next()
})
server.on('after', (req, res, next) => console.log(res._data))

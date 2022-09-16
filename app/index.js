'use strict'

const config = require('config')
const restify = require('restify')

const router = require('./routes')


let server

const init = async () => {
    if (server !== undefined) { return server }

    server = restify.createServer({
        name: config.get('service.name'),
        ignoreTrailingSlash: true,
        formatters: {
            'application/json': (req, res, body) => JSON.stringify(body, null, 2)
        }
    })

    // Initialize pre-routing plugins
    server.pre(restify.plugins.pre.dedupeSlashes())

    // Initialize server plugins
    server.use(restify.plugins.jsonp())
    server.use(restify.plugins.bodyParser())
    server.use(restify.plugins.queryParser())

    // Initialize app routes
    router.applyRoutes(server)

    // Log requests and responses to console
    server.pre((req, res, next) => {
        console.log(`\n>>> ${res.statusCode} ${req.method} ${req.url}`)
        next()
    })
    server.on('after', (req, res, next) => console.log(res._data))

    return server
}

const start = async () => {
    // Initialize the server
    await init()

    // Run the app server
    return server.listen(process.env.PORT || config.get('service.port'), async () => {
        console.log(`${server.name} listening at ${server.url}`)
    })
}

const stop = async () => server.close()


module.exports = { init, start, stop }
if (require.main === module) {
    if (process.argv[2] === 'start') start()
    if (process.argv[2] === 'stop')  stop()
}
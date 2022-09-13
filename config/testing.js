'use strict'

const path = require('path')

process.env.NODE_ENV = 'testing'


module.exports = {
    service: {
        port: 3000,
        root: path.resolve(__dirname, '..')
    },
    database: {
        name: "test.sqlite"
    }
}
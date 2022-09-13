'use strict'

const path = require('path')


module.exports = {
    service: {
        port: 3000,
        root: path.resolve(__dirname, '..')
    },
    database: {
        name: "app.sqlite"
    }
}
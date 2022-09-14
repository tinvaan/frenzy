'use strict'

const path = require('path')


module.exports = {
    service: {
        port: 3000,
        name: 'frenzy',
        root: path.resolve(__dirname, '..')
    },
    database: {
        name: "dev.sqlite"
    }
}
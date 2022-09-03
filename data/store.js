'use strict'

const fs = require('fs')
const path = require('path')

const { Sequelize } = require('sequelize')

const { Users } = require('../models/users')
const { Restaurants } = require('../models/restaurants')


const connection = new Sequelize('sqlite::memory')
const data = (target) => fs.readFileSync(path.resolve(__dirname, `${target}.json`), 'utf-8')


exports.up = async () => {
    Users(connection).bulkCreate(Object.values(data('users')))
    Restaurants(connection).bulkCreate(Object.values(data('restaurants')))
}

exports.down = () => connection.close()

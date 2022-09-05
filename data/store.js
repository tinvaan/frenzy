'use strict'

const fs = require('fs')
const path = require('path')

const { Sequelize } = require('sequelize')

const { Users } = require('../app/models/users')
const { Restaurants } = require('../app/models/restaurants')


const data = {
    users: () => {
        const content = fs.readFileSync(path.resolve(__dirname, 'users.json'), 'utf-8')
        return Object.values(JSON.parse(content))
            .map(item => Object({
                'name': item.name,
                'balance': item.cashBalance,
                'purchases': item.purchaseHistory,
            }))
    },

    restaurants: () => {
        const content = fs.readFileSync(path.resolve(__dirname, 'restaurants.json'), 'utf-8')
        return Object.values(JSON.parse(content))
            .map(item => Object({
                'menu': item.menu,
                'name': item.restaurantName,
                'balance': item.cashBalance,
                'timings': item.openingHours,
            }))
    }
}


// Connect to a database and define model instances
const connection = new Sequelize({
    logging: false,
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', 'dev.sqlite')
})
const u = Users(connection)
const r = Restaurants(connection)

// Populate database with raw data
const up = () => {
    u.sync()
        .catch(err => console.error(err))
        .then(res => u.bulkCreate(data.users()))
    r.sync()
        .catch(err => console.error(err))
        .then(res => r.bulkCreate(data.restaurants()))
}

// Cleanup the database
const down = () => {
    u.destroy({ truncate: true, cascade: true })
    r.destroy({ truncate: true, cascade: true })
    connection.close()
}


module.exports = { up, down, connection }


if (require.main === module) {
    connection.sync({force: true})
        .catch(err => console.error(err))
        .then(res => {
            if (process.argv[2] === 'up')   return up()
            if (process.argv[2] === 'down') return down()
        })
}

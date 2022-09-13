'use strict'

const fs = require('fs')
const path = require('path')
const config = require('config')

const TrieSearch = require('trie-search')
const { Sequelize } = require('sequelize')

const { Users } = require('../app/models/users')
const { Restaurants } = require('../app/models/restaurants')


const trie = new TrieSearch('name')
const data = {
    users: () => {
        const content = fs.readFileSync(path.resolve(__dirname, 'users.json'), 'utf-8')
        return Object.values(JSON.parse(content))
            .map(item => Object({
                'id': item.id,
                'name': item.name,
                'balance': item.cashBalance,
                'purchases': item.purchaseHistory,
            }))
    },

    restaurants: () => {
        const content = fs.readFileSync(path.resolve(__dirname, 'restaurants.json'), 'utf-8')
        return Object.values(JSON.parse(content))
            .map(item => {
                // Populate search index
                trie.map(item.restaurantName, {food: null, restaurant: item.restaurantName})
                item.menu.forEach(dish => {
                    trie.map(dish.dishName, {food: dish.dishName, restaurant: item.restaurantName})
                })

                return {
                    'menu': item.menu,
                    'name': item.restaurantName,
                    'balance': item.cashBalance,
                    'timings': item.openingHours,
                }
            })
    }
}


// Connect to a database and define model instances
let conn,
    connection = (db = config.get('database.name')) => {
        if (!conn) {
            conn = new Sequelize({
                logging: false,
                dialect: 'sqlite',
                storage: path.resolve(__dirname, '..', db)
            })
        }
        return conn
    }


// Instantiate models
const users = Users(connection())
const restaurants = Restaurants(connection())


// Populate database with raw data
const up = async () => {
    await users.sync()
    await users.bulkCreate(data.users())

    await restaurants.sync()
    await restaurants.bulkCreate(data.restaurants())
}

// Cleanup the database
const down = async () => {
    await users.destroy({ truncate: true, cascade: true })
    await restaurants.destroy({ truncate: true, cascade: true })
}


module.exports = {
    up, down, data, trie, users, restaurants, connection
}


if (require.main === module) {
    connection().sync({force: true})
        .catch(err => console.error(err))
        .then(res => {
            if (process.argv[2] === 'up')   return up()
            if (process.argv[2] === 'down') return down()
        })
}

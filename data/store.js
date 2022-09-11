'use strict'

const fs = require('fs')
const path = require('path')

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
const connection = (db='dev.sqlite') => {
    return new Sequelize({
        logging: false,
        dialect: 'sqlite',
        storage: path.resolve(__dirname, '..', db)
    })
}
const u = Users(connection())
const r = Restaurants(connection())

// Populate database with raw data
const up = async () => {
    await u.sync()
    await u.bulkCreate(data.users())

    await r.sync()
    await r.bulkCreate(data.restaurants())
}

// Cleanup the database
const down = async () => {
    await u.destroy({ truncate: true, cascade: true })
    await r.destroy({ truncate: true, cascade: true })
}


module.exports = { up, down, data, trie, connection }


if (require.main === module) {
    connection().sync({force: true})
        .catch(err => console.error(err))
        .then(res => {
            if (process.argv[2] === 'up')   return up()
            if (process.argv[2] === 'down') return down()
        })
}

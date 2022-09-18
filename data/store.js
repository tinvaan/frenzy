'use strict'

const fs = require('fs')
const path = require('path')
const config = require('config')

const TrieSearch = require('trie-search')
const { Sequelize, QueryTypes } = require('sequelize')

const datetime = require('../utils/datetime')
const { Users } = require('../app/models/users')
const { Restaurants } = require('../app/models/restaurants')


const trie = new TrieSearch('name', { ignoreCase: true })
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

    restaurants: async () => {
        const content = fs.readFileSync(path.resolve(__dirname, 'restaurants.json'), 'utf-8')
        return Promise.all(
            Object.values(JSON.parse(content))
                .map(async (item) => {
                    // Setup FTS & search trie
                    await connection().query(
                        `CREATE VIRTUAL TABLE IF NOT EXISTS dishes USING fts5(restaurant, dish);`
                    )

                    trie.map(item.restaurantName, {dish: null, restaurant: item.restaurantName})
                    item.menu.forEach(async (dish) => {
                        let opts = {
                            type: QueryTypes.INSERT,
                            replacements: { restaurant: item.restaurantName, dish: dish.dishName }
                        },
                        sql = `INSERT INTO dishes(restaurant, dish) VALUES(:restaurant, :dish)`
                        await connection().query(sql, opts)

                        trie.map(dish.dishName, { dish: dish.dishName, restaurant: item.restaurantName })
                    })

                    return {
                        'menu': item.menu,
                        'name': item.restaurantName,
                        'balance': item.cashBalance,
                        'timings': Object.assign({}, ...datetime.parse(item.openingHours))
                    }
                })
        )
    }
}


// Connect to a database and define model instances
let conn,
    connection = (db = config.get('database.name')) => {
        if (!conn) {
            conn = new Sequelize({
                logging: false,
                dialect: 'sqlite',
                dialectOptions: { multipleStatements: true },
                storage: `www-data ${path.resolve(__dirname, '..', db)}`,
            })
        }
        return conn
    }


// Instantiate models
const users = Users(connection())
const restaurants = Restaurants(connection())


// Populate database with raw data
const up = async () => {
    try {
        await users.sync({ force: true })
        await users.bulkCreate(data.users())
    
        await restaurants.sync({ force: true })
        await restaurants.bulkCreate(await data.restaurants())
    } catch (err) {
        console.error('Failed to populate database', err)
    }
}

// Cleanup the database
const down = async () => {
    try {
        // Clean up tables
        await users.destroy({ truncate: true, cascade: true })
        await restaurants.destroy({ truncate: true, cascade: true })

        // Drop virtual table
        const [metadata, records] = await connection().query(`DROP TABLE dishes;`)
    } catch (err) {
        console.error('Failed to cleanup database', err)
    }
}


module.exports = { up, down, data, trie, users, restaurants, connection }
if (require.main === module) {
    connection().sync({force: true})
        .catch(err => console.error(err))
        .then(res => {
            if (process.argv[2] === 'up')   up()
            if (process.argv[2] === 'down') down()
        })
}

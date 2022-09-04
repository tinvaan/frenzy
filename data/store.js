'use strict'

const fs = require('fs')
const path = require('path')

const { Sequelize } = require('sequelize')

const { Users } = require('../app/models/users')
const { Restaurants } = require('../app/models/restaurants')


const connection = new Sequelize({
    dialect: 'sqlite', storage: path.resolve(__dirname, '..', 'dev.sqlite')
})

const shorten = (rows) => rows.splice(0, 5000)

const data = (target) => fs.readFileSync(path.resolve(__dirname, `${target}.json`), 'utf-8')

const up = () => {
    const u = Users(connection),
          r = Restaurants(connection)

    u.sync()
        .catch(err => console.error(err))
        .then(res => {
            console.log('\nPopulating users database ...')
            u.bulkCreate(shorten(Object.values(data('users'))))
        })
    r.sync()
        .catch(err => console.error(err))
        .then(res => {
            console.log('\nPopulating restaurants database ...')
            u.bulkCreate(shorten(Object.values(data('restaurants'))))
        })
}

const down = () => connection.close()


module.exports = { up, down, connection }

if (require.main === module) {
    connection.sync({force: true})
        .catch(err => console.error(err))
        .then(res => {
            if (process.argv[2] === 'up')   return up()
            if (process.argv[2] === 'down') return down()
        })
}

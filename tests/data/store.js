'use strict'

const path = require('path')
const { Sequelize } = require('sequelize')

const store = require('../../data/store')
const { Users } = require('../../app/models/users')
const { Restaurants } = require('../../app/models/restaurants')


const db = {}


beforeEach(async () => {
    db.users = Users(store.connection)
    await db.users.sync({force: true})

    db.restaurants = Restaurants(store.connection)
    await db.users.sync({force: true})
})

afterEach(async () => {
    delete db.users
    delete db.restaurants
})

describe('Users model population', () => {
    test('Users model insertion', async () => {
        const before = await db.users.findAll()
        expect(before.length).toEqual(0)

        await store.up()
        const after = await db.users.findAll()
        expect(after.length).toBeGreaterThan(0)
    })

    test('Users model cleanup', async () => {
        // Populate the database
        await store.up()
        expect(db.users.findAll()).resolves.toBeDefined()

        // Cleanup the database
        await store.down()
        expect(db.users.findAll()).rejects.toBeDefined()
    })
})

describe('Restaurants model population', () => {
    test('Restaurants model insertion', async () => {
        const before = await db.restaurants.findAll()
        expect(before.length).toBeLessThan(store.data.restaurants().length)

        await store.up()

        const after = await db.restaurants.findAll()
        expect(after.length).toEqual(store.data.restaurants().length)
    })

    test('Restaurants model cleanup', async () => {
        // Populate the database
        await store.up()
        const before = await db.restaurants.findAll()
        expect(before.length).toBeGreaterThan(0)

        // Cleanup the database
        await store.down()
        const after = await db.restaurants.findAll()
        expect(after.length).toEqual(0)
        // try { await db.restaurants.findAll() } catch (err) { expect(err).not.toBeNull() }
    })
})

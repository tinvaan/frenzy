'use strict'

const fs = require('fs')
const path = require('path')
const config = require('config')

const store = require('../../data/store')


beforeEach(async () => {
    await store.users.sync({ force: true })
    await store.restaurants.sync({ force: true })
})

afterEach(async () => {
    await store.users.destroy({ truncate: true, cascade: true })
    await store.restaurants.destroy({ truncate: true, cascade: true })
})

afterAll(async () => {
    // Remove the database
    const dbpath = path.resolve(config.get('service.root'),
                                config.get('database.name'))
    if (fs.existsSync(dbpath)) { fs.unlinkSync(dbpath) }
})

describe('Users model population', () => {
    test('Users model insertion', async () => {
        const before = await store.users.findAll()
        expect(before.length).toEqual(0)

        await store.up()
        const after = await store.users.findAll()
        expect(after.length).toBeGreaterThan(0)
    })

    test('Users model cleanup', async () => {
        // Populate the database
        await store.up()
        expect(store.users.findAll()).resolves.toBeDefined()

        // Cleanup the database
        await store.down()
        expect(store.users.findAll()).resolves.toEqual([])
    })
})

describe('Restaurants model population', () => {
    test('Restaurants model insertion', async () => {
        const before = await store.restaurants.findAll()
        expect(before.length).toBeLessThan(store.data.restaurants().length)

        await store.up()

        const after = await store.restaurants.findAll()
        expect(after.length).toEqual(store.data.restaurants().length)
    })

    test('Restaurants model cleanup', async () => {
        // Populate the database
        await store.up()
        const before = await store.restaurants.findAll()
        expect(before.length).toBeGreaterThan(0)

        // Cleanup the database
        await store.down()
        const after = await store.restaurants.findAll()
        expect(after.length).toEqual(0)
    })
})

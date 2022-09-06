'use strict'

const test = require('blue-tape')

const store = require('../../data/store')
const { Users } = require('../../app/models/users')
const { Restaurants } = require('../../app/models/restaurants')

const u = Users(store.connection),
      r = Restaurants(store.connection)


test('Users model insertion', async (t) => {
    const before = await u.findAll()
    t.notEqual(before.length, store.data.users().length)

    await store.up()

    const after = await u.findAll()
    t.equal(after.length, store.data.users().length)
})

test('Restaurants model insertion', async (t) => {
    const before = await r.findAll()
    t.notEqual(before.length, store.data.restaurants().length)

    await store.up()

    const after = await r.findAll()
    t.equal(after.length, store.data.restaurants().length)
})

test('Users model cleanup', async (t) => {
    // Populate the database
    await store.up()

    const before = await u.findAll()
    t.assert(before.length)

    // Cleanup the database
    await store.down()

    const after = await u.findAll()
    t.equal(after.length, 0)
})

test('Restaurants model cleanup', async (t) => {
    // Populate the database
    await store.up()

    const before = await r.findAll()
    t.assert(before)

    // Cleanup the database
    await store.down()

    const after = await r.findAll()
    t.equal(after.length, 0)
})

'use strict'

const { app } = require('../index')

const fixtures = require('../../fixtures')
const store = require('../../../data/store')
const { server } = require('../../../app/index')


beforeEach(async () => await store.up())
afterEach(async () => await store.down())
afterAll(() => server.close())

describe('Query user details', () => {
    test('Show all users', async () => {
        let r = await app.get('/users',)
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(10)

        r = await app.get('/users').query({page: 7})
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(10)
    })

    test('Fetch a user by id', async () => {
        const user = await store.users.findOne({ where: { id: 0 } })

        let r = await app.get('/users/foobar')
        expect(r.statusCode).toEqual(404)
        expect(r.body.message).toEqual('User(foobar) not found')

        r = await app.get(`/users/${user.id}`)
        expect(r.statusCode).toEqual(200)
        expect(r.body.name).toEqual(user.name)
        expect(r.body.balance).toEqual(user.balance)
        expect(r.body.purchases).toEqual(user.purchases)
    })

    test('List all user purchases', async () => {
        const user = await store.users.findOne({ where: { id: 0 } })

        let r = await app.get(`/users/12421435234532453/purchases`)
        expect(r.statusCode).toEqual(404)

        r = await app.get(`/users/${user.id}/purchases`)
        expect(r.statusCode).toEqual(200)
        expect(r.body).toEqual(fixtures.read('users', '0', true).purchaseHistory)
    })

    test('Purchase an item from the menu', async () => {
        const user = await store.users.findOne({ where: { id: 13 } })
        const restaurant = await store.restaurants.findOne({ where: { name: '024 Grille' } })
        const before = { balance: { user: user.balance, restaurant: restaurant.balance } }

        let r = await app.post('/users/11/purchase').send({})
        expect(r.statusCode).toEqual(400)

        r = await app.post('/users/12/purchase').send({ dish: 'Fish fingers' })
        expect(r.statusCode).toEqual(400)

        r = await app.post('/users/12/purchase').send({ restaurant: 'Ullis Grills' })
        expect(r.statusCode).toEqual(400)

        r = await app.post('/users/13/purchase')
            .send({ dish: 'Unknown', restaurant: 'Unknown' })
        expect(r.statusCode).toEqual(404)
        expect(r.body.message).toEqual('Restaurant(Unknown) not found')

        r = await app.post('/users/13/purchase')
            .send({ dish: 'Unknown', restaurant: restaurant.id })
        expect(r.statusCode).toEqual(404)
        expect(r.body.message).toEqual('Dish(Unknown) not found')

        r = await app.post('/users/13/purchase')
            .send({ dish: 'Sweetbreads', restaurant: restaurant.id })
        await user.reload()
        await restaurant.reload()
        expect(r.statusCode).toEqual(200)
        expect(user.balance).toEqual(before.balance.user - r.body.transactionAmount)
        expect(restaurant.balance).toEqual(before.balance.restaurant + r.body.transactionAmount)
    })
})

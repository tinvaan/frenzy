'use strict'

const request = require('supertest')

const store = require('../../data/store')
const fixtures = require('../../tests/fixtures')
const { server } = require('../../app/index')

const app = request(server)


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
        let r = await app.get('/users/foobar')
        expect(r.statusCode).toEqual(404)
        expect(r.body.message).toEqual('User(foobar) not found')

        const user = await store.users.findOne({ where: { id: 0 } })

        r = await app.get(`/users/${user.id}`)
        expect(r.statusCode).toEqual(200)
        expect(r.body.name).toEqual(user.name)
        expect(r.body.balance).toEqual(user.balance)
        expect(r.body.purchases).toEqual(user.purchases)
    })
})

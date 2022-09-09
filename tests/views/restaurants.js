'use strict'

const moment = require('moment')
const request = require('supertest')

const store = require('../../data/store')
const { server } = require('../../app/index')
const app = request(server)


beforeEach(async () => await store.up())
afterEach(async () => await store.down())
afterAll(() => server.close())

describe('Query restaurants details', () => {
    test('Show all restaurants', async () => {
        let r = await app.get('/restaurants',)
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(10)

        r = await app.get('/restaurants?page=7')
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(10)
    })

    test('Fetch a restaurant by id', async () => {
        let r = await app.get('/restaurants/foobar')
        expect(r.statusCode).toEqual(404)
        expect(r.body.message).toEqual('Restaurant not found')

        r = await app.get('/restaurants?records=1')
        const expected = r.body.pop()

        r = await app.get(`/restaurants/${expected.id}`)
        expect(r.statusCode).toEqual(200)
        expect(r.body.name).toEqual(expected.name)
        expect(r.body.menu).toEqual(expected.menu)
        expect(r.body.timings).toEqual(expected.timings)
    })

    test('Show all restaurants open at a certain datetime', async () => {
        let r = await app.get('/restaurants/open?time=foobar')
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open')
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toBeGreaterThan(1)

        r = await app.get(`/restaurants/open?time=${moment().toISOString()}`)
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toBeGreaterThan(1)
    })
})

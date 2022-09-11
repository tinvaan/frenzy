'use strict'

const fs = require('fs')
const path = require('path')
const request = require('supertest')

const store = require('../../data/store')
const fixtures = require('../../tests/fixtures')
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
        let r = await app.get('/restaurants/open').query({time: ''})
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open').query({time: 'foobar'})
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open')
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toBeGreaterThan(1)

        r = await app.get('/restaurants/open').query({ time: '2022-09-11T09:53:58.821Z' })
        expect(r.statusCode).toEqual(200)
        expect(r.body).toEqual(fixtures.read('restaurants', '2022-09-11T09:53:58.821Z', true))

        // TODO: Fixme
        r = await app.get('/restaurants/open').query({ time: '2022-09-12T17:45:46.303Z' })
        expect(r.statusCode).toEqual(200)
        expect(r.body).toEqual(fixtures.read('restaurants', '2022-09-12T17:45:46.303Z', true))
    })

    test('Filter restaurants for dishes within a price range', async () => {
        let r = await app.get('/restaurants/sort')
        expect(r.statusCode).toEqual(400)
        expect(r.body.message).toEqual('Invalid query parameters')

        r = await app.get('/restaurants/sort')
                         .query({ x: 10, y: 10, price: 25 })
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(10)

        r = await app.get('/restaurants/sort')
                     .query({ x: 10, y: 30, price: 25 })
        expect(r.statusCode).toEqual(200)
        expect(r.body.length).toEqual(30)
    })

    test('Search for restaurants or dishes', async () => {
        const names = ['Roma', 'Postum', 'Milk Veal', 'Roma Ristorante']
        names.forEach(async (q) => {
            let r = await app.get('/restaurants/search').query({ name: q })

            expect(r.statusCode).toEqual(200)
            r.body.forEach(res => {
                expect(
                    res.food?.toLowerCase().includes(q.toLowerCase()) ||
                    res.restaurant?.toLowerCase().includes(q.toLowerCase())
                ).toBeTruthy()
            })
        })
    })
})

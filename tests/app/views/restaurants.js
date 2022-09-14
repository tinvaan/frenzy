'use strict'

const fs = require('fs')
const path = require('path')
const config = require('config')
const request = require('supertest')

const service = require('../../../app')
const store = require('../../../data/store')
const fixtures = require('../../fixtures')


let app

beforeAll(async () => {
    await store.up()
    const server = await service.start()

    app = request(server)
})

afterAll(async () => {
    await store.down()
    await service.stop()

    // Remove the database
    const dbpath = path.resolve(config.get('service.root'),
                                config.get('database.name'))
    if (fs.existsSync(dbpath)) { fs.unlinkSync(dbpath) }
})

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

        const restaurant = await store.restaurants.findOne({ where: { name: '024 Grille' } })

        r = await app.get(`/restaurants/${restaurant.id}`)
        expect(r.statusCode).toEqual(200)
        expect(r.body.name).toEqual(restaurant.name)
        expect(r.body.menu).toEqual(restaurant.menu)
        expect(r.body.timings).toEqual(restaurant.timings)
    })

    test('Show all restaurants open at a certain datetime', async () => {
        let r = await app.get('/restaurants/open')
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open').query({time: ''})
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open').query({time: 'foobar'})
        expect(r.statusCode).toEqual(400)

        r = await app.get('/restaurants/open').query({ time: '2022-09-11T09:53:58.821Z' })
        expect(r.statusCode).toEqual(200)
        expect(r.body).toEqual(fixtures.read('restaurants', '2022-09-11T09:53:58.821Z', true))

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

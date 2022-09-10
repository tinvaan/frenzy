'use strict'

const moment = require('moment-range').extendMoment(require('moment'))
const { BadRequestError, NotFoundError } = require('restify-errors')

const store = require('../../data/store')
const datetime = require('../../utils/datetime')
const { connection } = require('../../data/store')
const { Restaurants } = require('../models/restaurants')


const r = Restaurants(connection)


exports.show = async (req, res, next) => {
    const restaurants = await r.findAll({
        offset: req.query.page, limit: req.query.records || 10
    })
    res.json(restaurants)
    next()
}

exports.fetch = async (req, res, next) => {
    const restaurant = await r.findOne({ where: { id: req.params.id } })
    if (!restaurant) {
        return next(new NotFoundError(`Restaurant not found`))
    }

    res.json(restaurant)
    next()
}

exports.open = async (req, res, next) => {
    const time = moment(req.query.time).set(datetime.defaults.dates)
    if (!time.isValid()) {
        return next(new BadRequestError('Invalid date'))
    }

    const restaurants = await r.findAll()
    const active = restaurants
        .filter((restaurant) => {
            let timings = datetime.parse(restaurant.timings).flat()
            return timings.find(t => time.within(t.hours) && t.day === time.format('ddd'))
        })
        .map(restaurant => Object({ name: restaurant.name, timings: restaurant.timings }))

    res.json(active)
    next()
}

exports.search = async (req, res, next) => {
    if (!req.query.name) {
        return next(BadRequestError('Invalid search term'))
    }

    res.json(store.trie.search(req.query.name))
    next()
}

exports.priceSort = async (req, res, next) => {
    const x = req.query.x,
          y = req.query.y,
          price = req.query.price,
          more = req.query.more || true,
          restaurants = await r.findAll()
    if (!x || !y) {
        return next(new BadRequestError('Invalid query parameters'))
    }

    // Filter restaurants that have atleast 'x' items within the price range
    let filtered = restaurants.filter(restaurant => {
        const dishes = restaurant.menu.filter((item => {
            return item.price <= price
        }))
        return more ? dishes.length > x : dishes.length <= x
    })

    // Sort them alphabetically and return the top 'y' items
    filtered.sort((a, b) => a.name.localeCompare(b.name)).splice(y)

    res.json(filtered.map(item => item.name))
    next()
}

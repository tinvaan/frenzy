'use strict'

const moment = require('moment-range').extendMoment(require('moment'))
const { BadRequestError } = require('restify-errors')

const datetime = require('../../utils/datetime')
const { connection } = require('../../data/store')
const { Restaurants } = require('../models/restaurants')


const r = Restaurants(connection)


exports.show = async (req, res, next) => {
    const restaurants = await r.findAll({ limit: 5, offset: req.query.page })
    res.json(restaurants)
    next()
}

exports.fetch = async (req, res, next) => {
    const restaurant = await r.findOne({ where: { id: req.params.id } })
    res.json(restaurant)
    next()
}

exports.open = async (req, res, next) => {
    const time = moment(req.query.time).set(datetime.defaults.dates)
    if (!time.isValid()) { return next(new BadRequestError('Invalid date')) }

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

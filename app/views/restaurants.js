'use strict'

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

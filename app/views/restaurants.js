'use strict'

const moment = require('moment')
const { QueryTypes } = require('sequelize')
const { BadRequestError, NotFoundError, InternalError } = require('restify-errors')

const store = require('../../data/store')
const datetime = require('../../utils/datetime')


exports.show = async (req, res, next) => {
    const restaurants = await store.restaurants.findAll({
        offset: req.query.page, limit: req.query.records || 10
    })
    res.json(restaurants)
    next()
}

exports.fetch = async (req, res, next) => {
    const restaurant = await store.restaurants.findOne({ where: { id: req.params.id } })
    if (!restaurant) {
        return next(new NotFoundError(`Restaurant not found`))
    }

    res.json(restaurant)
    next()
}

exports.open = async (req, res, next) => {
    const d = moment(req.query.time).set(datetime.defaults.dates)
    if (req.query.time === undefined || !d.isValid()) {
        return next(new BadRequestError('Invalid date'))
    }

    try {
        const regular = `SELECT r.name FROM restaurants r, json_each(r.timings) dt WHERE dt.key = '${d.format('ddd')}' AND ` +
                        `(json_extract(r.timings, '$.' || dt.key || '[0].start') < '${d.format('hh:mm A')}' AND ` +
                         `json_extract(r.timings, '$.' || dt.key || '[0].end') > '${d.format('hh:mm A')}')`

        const overnight = `SELECT r.name FROM restaurants r, json_each(r.timings) dt WHERE dt.key = '${d.format('ddd')}' AND ` +
                          `(json_extract(r.timings, '$.' || dt.key || '[1].start') < '${d.format('hh:mm A')}' AND ` +
                           `json_extract(r.timings, '$.' || dt.key || '[1].end') > '${ d.format('hh:mm A')}')`

        const [rows, metadata] = await store.connection().query(`${regular} UNION ${overnight};`)

        res.json(rows.map(row => row.name))
        next()
    } catch (err) {
        console.error(err)
        return next(InternalError('Failed to query open restaurants'))
    }
}

exports.search = async (req, res, next) => {
    if (!req.query.name) {
        return next(BadRequestError('Invalid search term'))
    }

    let sql, metadata,
        rows = store.trie.search(req.query.name)
    if (rows.length === 0) {
        [rows, metadata] = await store.connection().query(
            `SELECT * FROM dishes(:name) ORDER BY rank;`, {
                type: QueryTypes.SELECT,
                replacements: { name: req.query.name }
            }
        )
    }

    res.json([rows].flat())
    next()
}

exports.priceSort = async (req, res, next) => {
    const x = req.query.x,
          y = req.query.y,
          price = req.query.price,
          more = req.query.more || true,
          restaurants = await store.restaurants.findAll()
    if (!x || !y) {
        return next(new BadRequestError('Invalid query parameters'))
    }

    // Filter restaurants that have atleast 'x' items within the price range
    let filtered = restaurants.filter(restaurant => {
        const dishes = restaurant.menu.filter((item => item.price <= price ))
        return more ? dishes.length > x : dishes.length <= x
    })

    // Sort them alphabetically and return the top 'y' items
    filtered.sort((a, b) => a.name.localeCompare(b.name)).splice(y)

    res.json(filtered.map(item => item.name))
    next()
}

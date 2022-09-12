'use strict'

const Router = require('restify-router').Router

const users = require('./views/users')
const dishes = require('./views/dishes')
const restaurants = require('./views/restaurants')


const router = new Router()

router.get('/users', users.show)
router.get('/users/:id', users.fetch)
router.get('/users/:id/purchases', users.purchases)
router.post('/users/:id/purchase', users.purchase)

router.get('/restaurants', restaurants.show)
router.get('/restaurants/:id', restaurants.fetch)
router.get('/restaurants/open', restaurants.open)
router.get('/restaurants/sort', restaurants.priceSort)
router.get('/restaurants/search', restaurants.search)


module.exports = router

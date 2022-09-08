'use strict'

const Router = require('restify-router').Router

const users = require('./views/users')
const dishes = require('./views/dishes')
const restaurants = require('./views/restaurants')


const router = new Router()
router.get('/users', users.show)
router.get('/users/:id', users.fetch)
router.get('/dishes/', dishes.show)
router.get('/dishes/:id', dishes.fetch)
router.get('/restaurants', restaurants.show)
router.get('/restaurants/:id', restaurants.fetch)
router.get('/restaurants/open', restaurants.open)


module.exports = router

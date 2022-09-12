'use strict'

const moment = require('moment')
const { BadRequestError, NotFoundError, InternalError } = require('restify-errors')

const store = require('../../data/store')


exports.show = async (req, res, next) => {
    const users = await store.users.findAll({
        offset: req.query.page, limit: req.query.records || 10
    })
    res.json(users)
    next()
}

exports.fetch = async (req, res, next) => {
    const user = await store.users.findOne({ where: { id: req.params.id } })
    if (!user) {
        return next(new NotFoundError(`User(${req.params.id}) not found`))
    }

    res.json(user)
    next()
}

exports.purchases = async (req, res, next) => {
    const user = await store.users.findOne({ where: { id: req.params.id } })
    if (!user) {
        return next(new NotFoundError(`User(${req.params.id}) not found`))
    }

    res.json(user.purchases)
    next()
}

exports.purchase = async (req, res, next) => {
    if (req.body.dish === undefined || req.body.restaurant === undefined) {
        return next(new BadRequestError('Invalid request'))
    }

    let { dish, restaurant } = req.body,
        user = await store.users.findOne({ where: { id: req.params.id } })
    if (!user) {
        return next(new NotFoundError(`User(${req.params.id}) not found`))
    }

    // Find the restaurant
    restaurant = await store.restaurants.findOne({ where: { id: restaurant } })
    if (!restaurant) {
        return next(new NotFoundError(`Restaurant(${req.body.restaurant}) not found`))
    }

    // Find the dish on the restaurant's menu
    dish = restaurant.menu.find(item => item.dishName === dish)
    if (!dish) {
        return next(new NotFoundError(`Dish(${req.body.dish}) not found`))
    }

    try {
        // Update the restaurant's cash balance
        restaurant.balance += req.body.price || dish.price
        await restaurant.save()

        // Populate the transaction(purchase) object
        const transaction = {
            dishName: dish.dishName,
            restaurantName: restaurant.name,
            transactionAmount: req.body.price || dish.price,
            transactionDate: moment().format('DD/MM/YYYY hh:mm A')
        }

        // Append transaction to user's purchase history and update cash balance
        user.purchases.push(transaction)
        user.balance -= transaction.transactionAmount
        await user.save()

        res.json(transaction)
        next()
    } catch (err) {
        console.error('Failed to process purchase')
        console.error(err)
        return next(InternalError('Failed to process purchase'))
    }
}

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

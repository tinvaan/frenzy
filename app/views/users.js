'use strict'

const { Users } = require('../models/users')
const { connection } = require('../../data/store')


const u = Users(connection)


exports.show = async (req, res, next) => {
    const users = await u.findAll({ limit: 5, offset: req.query.page })
    res.json(users)
    next()
}

exports.fetch = async (req, res, next) => {
    const user = await u.findOne({ where: {id: req.params.id} })
    res.json(user)
    next()
}

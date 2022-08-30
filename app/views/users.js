'use strict'

exports.show = (req, res, next) => {
    res.json({message: 'Fetching all users'})
    next()
}

exports.fetch = (req, res, next) => {
    res.json({message: `Fetching user with id: ${req.params.id}`})
    next()
}

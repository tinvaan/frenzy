'use strict'

exports.show = (req, res, next) => {
    res.send({message: 'Fetching all users'})
    next()
}

exports.fetch = (req, res, next) => {
    res.send({ message: `Fetching user with id: ${req.params.id}`})
    next()
}

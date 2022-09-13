'use strict'

const request = require('supertest')

const { server } = require('../../app/index')


exports.app = request(server)

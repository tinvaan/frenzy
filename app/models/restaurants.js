'use strict'

const { DataTypes: FIELDS } = require('sequelize')


const options = { timestamps: true, tableName: 'restaurants' }
const attributes = {
    menu: { type: FIELDS.JSON },
    timings: { type: FIELDS.JSON },
    balance: { type: FIELDS.FLOAT },
    name: { type: FIELDS.STRING, allowNull: false },
    id: { type: FIELDS.INTEGER, autoIncrement: true, primaryKey: true }
}

exports.Restaurants = (db) => db.define('Restaurants', attributes, options)

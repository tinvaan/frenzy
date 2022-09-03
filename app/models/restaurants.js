'use strict'

const { DataTypes: FIELDS } = require('sequelize')


const options = { timestamps: true, tableName: 'restaurants' }
const attributes = {
    menu: { type: FIELDS.JSON },
    name: { type: FIELDS.STRING, allowNull: true }, // TODO: {allowNull: false}
    balance: { type: FIELDS.FLOAT, field: 'cashBalance' },
    timings: { type: FIELDS.JSON, field: 'openingHours' },
    id: { type: FIELDS.UUID, defaultValue: FIELDS.UUIDV4, primaryKey: true }
}

exports.Restaurants = (db) => db.define('Restaurants', attributes, options)

'use strict'

const { DataTypes: FIELDS } = require('sequelize')


const options = { timestamps: true, tableName: 'users' }
const attributes = {
    name: { type: FIELDS.STRING, allowNull: true }, // TODO: {allowNull: false}
    balance: { type: FIELDS.FLOAT, field: 'cashBalance' },
    purchases: { type: FIELDS.JSON, field: 'purchaseHistory' },
    id: { type: FIELDS.UUID, defaultValue: FIELDS.UUIDV4, primaryKey: true }
}

exports.Users = (db) => db.define('Users', attributes, options)

'use strict'

const { DataTypes: FIELDS } = require('sequelize')


const options = { timestamps: true, tableName: 'users' }
const attributes = {
    balance: { type: FIELDS.FLOAT },
    purchases: { type: FIELDS.JSON },
    name: { type: FIELDS.STRING, allowNull: false },
    id: { type: FIELDS.INTEGER, autoIncrement: true, primaryKey: true }
}

exports.Users = (db) => db.define('Users', attributes, options)

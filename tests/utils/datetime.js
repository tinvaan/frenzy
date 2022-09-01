'use strict'

const test = require('blue-tape')
const moment = require('moment-range').extendMoment(require('moment'))

const { parse } = require('../../utils/datetime')


test('A list of valid restaurant timings should parse fine', async (t) => {
    const values = [
        " Tues 7: 45 am - 2 am ",
        " Thurs 5: 45 pm - 12 am ",
        " Sat 10: 15 am - 9 pm",
        " Fri, Sun 6 am - 9 pm ",
        " Mon, Weds 11:45 am - 4:45 pm ",
        " Mon, Weds 11:45 am - 4:45 pm / Fri, Sun 6 am - 9 pm / Sat 10: 15 am - 9 pm",
        " Mon, Weds 11:45 am - 4:45 pm / Tues 7:45 am - 2 am / Thurs 5:45 pm - 12 am / Fri, Sun 6 am - 9 pm / Sat 10:15 am - 9 pm",
        "Mon, Weds 3:45 pm - 5 pm / Tues 11:30 am - 3 am / Thurs 10 am - 11:30 pm / Fri 7 am - 9:45 am / Sat 12:45 pm - 1:15 pm / Sun 2 pm - 7 pm"
    ]
    values.forEach(value => {
        for (let [_, item] of Object.entries(parse(value))) {
            Object.values(item).forEach(d => {
                t.ok(d.day)
                t.ok(moment.isRange(d.hours))
                t.true(d.hours.valueOf() >= 0)  // Check if hours form a valid range
            })
        }
    })
})

test('A list of invalid restaurant timings should not parse fine', async (t) => {
    const values = [
        "",
        " Mon, Tues 7:45 pm - 2 am",
        " Tues 7: 45 am - 2 am ",
        " Thurs 5: 45 pm - 12 am ",
        " Mon, Weds 11:45 am - 4:45 pm / Fri, Sun 6 am - 9 pm / Sat 10: 15 am - 9 pm",
        " Mon, Weds 11:45 am - 4:45 pm / Tues 7:45 am - 2 am / Thurs 5:45 pm - 12 am / Fri, Sun 6 am - 9 pm / Sat 10:15 am - 9 pm",
        "Mon, Weds 3:45 pm - 5 pm / Tues 11:30 am - 3 am / Thurs 10 am - 11:30 pm / Fri 7 am - 9:45 am / Sat 12:45 pm - 1:15 pm / Sun 2 pm - 7 pm"
    ]
    values.forEach(value => {
        for (let [_, item] of Object.entries(parse(value))) {
            Object.values(item).forEach(d => {
                t.ok(d.day)
                t.ok(moment.isRange(d.hours))
                t.false(d.hours.valueOf() >= 0) // Check for an invalid time range
            })
        }
    })
})
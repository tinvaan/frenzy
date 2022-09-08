'use strict'

const moment = require('moment-range').extendMoment(require('moment'))

const { parse } = require('../../utils/datetime')


function inspect(string, count) {
    for (let [_, days] of Object.entries(parse(string))) {
        expect(days.length).toBeGreaterThanOrEqual(1)
        if (count !== undefined) { expect(days.length).toEqual(count) }

        Object.values(days).forEach(d => {
            expect(d.day).toBeDefined()
            expect(moment.isRange(d.hours)).toBeTruthy()
            expect(d.hours.valueOf()).toBeGreaterThanOrEqual(0) // Check if hours form a valid range
        })
    }
}

describe('Parse a given weekly timetable string', () => {
    test('Same day time strings', () => {
        const strings = [
            " Fri 8: 00 am - 3 pm",
            " Sat 10: 15 am - 9 pm",
            " Tues 7: 45 am - 2 pm ",
            " Fri 8: 00 am - 3 pm / Sat 10: 15 am - 9 pm / Tues 7: 45 am - 2 pm ",
            " Tues 11:30 am - 3 am / Thurs 10 am - 11:30 pm / Fri 7 am - 9:45 am / Sat 12:45 pm - 1:15 pm / Sun 2 pm - 7 pm"
        ]
        strings.forEach(string => inspect(string))
    })

    test('Overnight time strings', () => {
        const strings = [
            "Fri 4 pm - 2:00 am",
            "Mon 8 pm - 1:00 am",
            " Thurs 5: 45 pm - 12 am ",
            "Thurs 6: 00 pm - 2:30 am",
        ]
        strings.forEach(string => inspect(string))
    })

    test('Multiple day time strings', () => {
        const strings = [
            " Fri, Sun 6 am - 9 pm ",
            " Thurs, Fri, Sun 6 am - 9 pm ",
            " Mon, Weds 11:45 am - 4:45 pm ",
            " Mon, Weds 11:45 am - 4:45 pm / Fri, Sun 6 am - 9 pm / Sat, Tues 10: 15 am - 9 pm",
            " Mon, Weds 11:45 am - 4:45 pm / Tues, Sat 7:45 am - 2 pm / Thurs, Fri, Sun 6 am - 9 pm",
            "Mon, Weds 3:45 pm - 5 pm / Tues, Thurs 11:30 am - 3 am / Fri 7 am - 9:45 am / Sat 12:45 pm - 1:15 pm / Sun 2 pm - 7 pm"
        ]
        strings.forEach(string => inspect(string))
    })

    test('Multiple day overnight time strings', () => {
        inspect("Mon, Tues 8 pm - 3 am", 4)
        inspect("Wed, Thurs, Fri 6:00 pm - 1:00 am", 6)
        inspect("Mon, Tues 8 pm - 3 am / Wed, Thurs, Fri 6:00 pm - 1:00 am")
    })
})

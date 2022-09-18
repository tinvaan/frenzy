'use strict'

const moment = require('moment')

const datetime = require('../../utils/datetime')


function inspect(string) {
    for (let dt of Object.values(datetime.parse(string))) {
        let days = Object.keys(dt),
            hours = Object.values(dt).flat()

        expect(days.length).toBeGreaterThan(0)
        expect(hours.length).toBeGreaterThanOrEqual(1)
    }
}

describe('Parse a given weekly timetable string', () => {
    test('Invalid time strings', () => {
        const strings = [
            "",
            "abcdef",
            "    12:45 AM",
        ]

        strings.forEach(string => {
            for (let dt of Object.values(datetime.parse(string))) {
                let days = Object.keys(dt)
                expect(days.includes('Invalid date')).toBeTruthy()
            }
        })
    })

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
        inspect("Mon, Tues 8 pm - 3 am")
        inspect("Wed, Thurs, Fri 6:00 pm - 1:00 am")
        inspect("Mon, Tues 8 pm - 3 am / Wed, Thurs, Fri 6:00 pm - 1:00 am")
    })
})

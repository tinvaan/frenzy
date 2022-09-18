'use strict'

const moment = require('moment')

const defaults = {
    dates: { month: 'Jan', year: 1970 }
}


const objectify = (schedule) => {
    const map = {}
    schedule.forEach(dt => {
        if (!Object.keys(map).includes(dt.day)) {
            map[dt.day] = [dt.hours]
        } else {
            map[dt.day].push(dt.hours)
        }
    })
    return map
}

/*
 * Returns a weekly schedule, given a string of daily opening and closing hours
 */
const parse = (timings) => {
    return timings.split('/').map(timing => {
        let overflows = [],
            days = timing.split(',').map(str => str.split('-')).flat()
                                    .map(str => str.trim()),
            [ open, close ] = days.splice(days.length - 2, 2),
            opening = moment(open, 'dddd hh:mm am').set(defaults.dates),
            closing = moment(close, 'hh:mm am').set('day', opening.day()).set(defaults.dates)

        days.push(opening.format('ddd'))

        // If closing time is earlier than the opening time,
        // let's assume that the closing time falls on the next calendar day
        if (closing.isSameOrBefore(opening)) {
            let dt = closing.clone()
            closing.endOf('day')
            dt.set('day', dt.day() + 1)
            days.forEach(d => overflows.push({
                day: d,
                hours: {
                    start: dt.clone().startOf('day').set(defaults.dates).format('hh:mm A'),
                    end: dt.set(defaults.dates).format('hh:mm A')
                }
            }))
        }

        days = days.map(d => Object({
            day: d,
            hours: {
                start: opening.set('day', d).format('hh:mm A'),
                end: closing.set('day', d).format('hh:mm A')
            }
        }))
        days.push(...overflows)
        return objectify(days)
    })
}


module.exports = { defaults, parse }

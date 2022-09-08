'use strict'

const moment = require('moment-range').extendMoment(require('moment'))

const defaults = {
    dates: { month: 'Jan', year: 1970 }
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
                hours: moment.range(
                    dt.clone().startOf('day').set(defaults.dates),
                    dt.set(defaults.dates)
                )
            }))
        }

        days = days.map(d => Object({
            day: d,
            hours: moment.range(opening.set('day', d), closing.set('day', d))
        }))
        days.push(...overflows)
        return days
    })
}


module.exports = { defaults, parse }

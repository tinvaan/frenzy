'use strict'

const moment = require('moment-range').extendMoment(require('moment'))

const defaults = {
    dates: {month: 'Jan', year: 1970}
}


/*
 * Returns a weekly schedule, given a string of daily opening and closing hours
 */
exports.parse = (timings) => {
    return timings.split('/').map(timing => {
        var days = timing.split(',').map(str => str.split('-')).flat()
                                    .map(str => str.trim())

        const [ open, close ] = days.splice(days.length - 2, 2)
        const opening = moment(open, 'dddd hh:mm am').set(defaults.dates)
        const closing = moment(close, 'hh:mm am').set('day', opening.day()).set(defaults.dates)

        days.push(opening.format('ddd'))
        return days.map(d => Object({
            day: d,
            hours: moment.range(opening.set('day', d), closing.set('day', d))
        }))
    })
}

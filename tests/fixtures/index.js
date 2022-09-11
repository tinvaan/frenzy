'use strict'

const fs = require('fs'),
      path = require('path')


exports.read = (dir, name, golden = false) => {
    const filename = golden ?
        path.resolve(__dirname, `golden/${dir}/${name}.json`) :
        path.resolve(__dirname, `${dir}/${name}.json`)
    return JSON.parse(fs.readFileSync(filename))
}

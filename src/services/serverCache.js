/**
 * Load in memory data that do not change often and 
 * are served very often. It is called at server startup
 * and you can reload it afterwards by calling it manually
 * through the proper API.
 */
'use strict'
const winston = require('winston')

let locales = []

const reloadLocales = async () => {
  try {
    locales = [{
      "locale": "fr",
    }, {
      "locale": "en",
    }]
  } catch (err) {
    throw err
  }
}

const load = async () => {
  try {
    winston.debug('Loading server cache')
    await reloadLocales()
    winston.debug('Server cache loaded')
  } catch (err) {
    throw Error('Cannot load server cache')
  }
}

exports.getLocales = () => { return locales }
exports.reloadLocales = reloadLocales
exports.load = load

/**
 * Load in memory data that do not change often and 
 * are served very often. It is called at server startup
 * and you can reload it afterwards by calling it manually
 * through the proper API.
 */
'use strict'
const winston = require('winston')

let locales = []
let aopData = []

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

const axios = require('axios')

const  reloadData = async () => {
  try {
    aopData = await axios.get('https://front.dxp.delivery/db/devdb/find_documents/kafka/kafka/cjo', { headers: {"Authorization": "Bearer SBS155*" }}).data
  } catch (error) {
    console.error(error)
  }

}

const load = async () => {
  try {
    winston.debug('Loading server cache')
    await reloadLocales()
    await reloadData()
    winston.debug('Server cache loaded')
  } catch (err) {
    throw Error('Cannot load server cache')
  }
}

exports.getLocales = () => { return locales }
exports.getData = () => { return aopData }
exports.reloadLocales = reloadLocales
exports.reloadData = reloadData
exports.load = load


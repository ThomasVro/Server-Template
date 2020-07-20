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
let max = null

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
    if(max === null) {
      let dates = []
      aopData = (await axios.get('https://front.dxp.delivery/db/devdb/find_documents/kafka/kafka/cjo', { headers: {"Authorization": "Bearer SBS155*" }})).data
      for(var i = 0; i < aopData.length; i++) {
        var date = (aopData[i].depHeader.creationTimestamp)
        dates.push(new Date(date))
      }
      max = new Date(Math.max(...dates))
      max = max.toISOString()
      console.log(max)
      console.log(aopData.length)
  }else {
      console.log('loading latest AOP')
      let request = 'https://front.dxp.delivery/db/devdb/find_documents/kafka/kafka/cjo/?depHeader.creationTimestamp[$gt]=' + max 
      
      //console.log(request)
      let newAop = (await axios.get(request, { headers: {"Authorization": "Bearer SBS155*" }})).data
      console.log(newAop)
      if(newAop.length === 0) {
        aopData = aopData
      }else {
        for(var i = 0; i < newAop.length; i++) {
          aopData.push(newAop[i])
          console.log(newAop[i])
        }
      }
      
      //console.log(aopData)
      
  }
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


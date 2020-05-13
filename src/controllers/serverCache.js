'use strict'
const serverCache = require('services/serverCache')
const WebWorker = require('services/WebWorker')
const tools = require('services/tools')

exports.readLocale = ({ params: { localeId }}, res) => {
  try {
    const locales = serverCache.getLocales()
    for (let i = 0; i < locales.length; i++) {
      if (locales[i].locale === localeId) {
        return res.status(200).send(locales[i])
      }
    }
    res.status(400).send('LOCALE_ID_NOT_FOUND')
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.reloadLocales = async (req, res) => {
  try {
    await serverCache.reloadLocales()
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.time = (req, res) => {
  try {
    var date = tools.getDateTime()
    res.status(200).send(date)
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.getAop = (req, res) => {
  try {
    if (!req.body) return res.status(400).send('no body provided') 
    const aopValues = WebWorker.FormatAop(req.body)
    res.status(200).send(aopValues)
  } catch(err) {
    res.status(500).send(err)
    console.log(err)
  }
}



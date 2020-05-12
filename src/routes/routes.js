'use strict'
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const winston = require('winston')
const ctrl = require('controllers')
const router = new express.Router()

const checkAuth = async (req, res, next, authorization) => {
  try {
    // do something to allow or reject the call
    return next()

    res.status(401).send()
  } catch (err) {
    // we never display the real error here for better security
    winston.error(err)
    res.status(401).send()
  }
}

router.use(bodyParser.json())
router.use(express.static(path.join(__dirname, '..', '..', 'static')))

// list your routes here
//router.get('/api/locales/:localeId', (req, res, next) => { checkAuth(req, res, next, 'accessRight') }, ctrl.serverCache.readLocale)
router.get('/api/date', (req, res, next) => { checkAuth(req, res, next, 'accessRight') }, ctrl.serverCache.time)
router.post('/api/aop', (req, res, next) => { checkAuth(req, res, next, 'accessRight') }, ctrl.serverCache.getAop)


// the URL is rewritten so the server always returns the index.html on all paths

// this is needed if your server serves single page apps
router.use('/*', (req, res) => { res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html')) })

module.exports = router

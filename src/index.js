'use strict'
// IIFE to allow use of async await at the top level
;(async () => {
  const path = require('path')
  require('app-module-path').addPath(__dirname)
  const { load } = require('services/serverCache')

  try {
    const http = require('http')
    const express = require('express')
    const fs = require('fs')
    const compression = require('compression')
    const helmet = require('helmet')
    const winston = require('winston')
    
    /**
     * Use one or the other depending on your need.
     * spdy is used to enable http2.
     * They are interchangeable when the server answers directly the API calls.
     * If the server is behind a reverse proxy the spdy module
     * might not work if you don't take care to configure the proxy properly.
     */
    // const spdy = require('spdy')
    const https = require('https')

    //const privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'privkey.pem'), 'utf8')
    //const certificate = fs.readFileSync(path.join(__dirname, '..', 'keys', 'fullchain.pem'),'utf8')
    //const credentials = { key: privateKey, cert: certificate }

    const cfg = require('config')
    const app = express()

    winston.level = cfg.global.logLevel

    // load data in the server memory
    await load()

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*') // in production you should remove and finely tune this header
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.header('Access-Control-Expose-Headers', 'Access-Token')
      
      if (req.method === 'OPTIONS') {
        res.status(200).send()
        return
      }
      next()
    })

    // Redirect http traffic to https
    // and hostname without prefix www. to hostname with it
    if (process.env.NODE_ENV === 'production') {
      app.use((req, res, next) => {
        let host = req.headers.host
        let redirectHost = false
        if (host.substring(0, 4) !== 'www.') {
          host =  `www.${host}`
          redirectHost = true
        }
        if (!req.secure || redirectHost) return res.redirect(301, `https://${host}${req.url}`)
        next()
      })
    }

    app.use(helmet())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    app.use(compression())

    // Mount the routes
    app.use(require('routes'))

    // Mount the http, https (or spdy) and socket servers
    http.createServer(app).listen(process.env.HTTP_PORT || cfg.global.httpPort)
    //const server = https.createServer(credentials, app).listen(process.env.HTTPS_PORT || cfg.global.httpsPort)
    //require('routes/sockets')(server)

    winston.debug('Server started')

  } catch (err) {
    console.log(err)
    process.exit()
  }
})()

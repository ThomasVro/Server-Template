'use strict'
const winston = require('winston')
const { makeTimestamp } = require('services/tools')

const handlePreflightRequest = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.end()
}

module.exports = server => {
  const io = require('socket.io')(
    server,
    Object.assign({ handlePreflightRequest } // https://github.com/socketio/socket.io/issues/3162
  ))

  const room1 = io.of('/room1')
  const room2 = io.of('/room2')

  const threads = []

  const getGuests = () => {
    return new Promise((resolve, reject) => {
      room1.clients((err, guests) => {
        if (err) return reject(err)
        resolve(guests)
      })
    })
  }

  const initThread = (socketIdRoom1, startTime) => {
    threads.push({
      socketIdRoom1,
      startTime
    })
  }

  const getThread = socketIdRoom1 => {
    for (let i = 0; i < threads.length; i++) {
      if (threads[i].socketIdRoom1 === socketIdRoom1) {
        return threads[i]
      }
    }
  }

  const removeThread = socketIdRoom1 => {
    for (let i = 0; i < threads.length; i++) {
      if (threads[i].socketIdRoom1 === socketIdRoom1) {
        threads.splice(i, 1)
        return
      }
    }
  }

  room1.on('connection', socketRoom1 => {
    const socketIdRoom1 = socketRoom1.id

    initThread(socketIdRoom1, makeTimestamp())

    socketRoom1.on('manualDisconnect', () => {
      socketRoom1.disconnect()
    })

    socketRoom1.on('disconnect', async () => {
      try {
        removeThread(socketIdRoom1)
      } catch (err) {
        winston.debug(err)
      }
    })
  })

  room2.use(async (socketRoom2, next) => {
    try {
      let token = socketRoom2.handshake.query.token
      // perform a check upon the token
      // you can throw an error to break the connection if need be

      next()
    } catch (err) {
      winston.error(err)
      socketRoom2.disconnect()
    }
  })
  .on('connection', async socketRoom2 => {
    try {
      // do something useful here
    } catch (err) {
      winston.error(err)
    }
  })
}

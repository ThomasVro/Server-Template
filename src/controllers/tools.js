'use strict'

const tools = require('services/tools')

exports.readDate = (req, res) => {
    try {
      const date = tools.getDateTime()
      console.log(date)
      return res.status(200).send(date)
    } catch (err) {
      res.status(500).send(err)
    }
  }

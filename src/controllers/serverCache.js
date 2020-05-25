'use strict'
const serverCache = require('services/serverCache')

exports.reloadLocales = async (req, res) => {
  try {
    await serverCache.reloadLocales()
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.reloadData = async (req, res) => {
  try {
    await serverCache.reloadData()
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err)
  }
}


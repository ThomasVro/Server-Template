'use strict'
const WebWorker = require('services/WebWorker')
const serverCache = require('services/serverCache')

exports.aopCalculation = (req, res) => {
  try {
    if (!req.body) return res.status(400).send('no body provided') 
    serverCache.reloadData()
    let data = serverCache.getData()
    //console.log(data)
    console.log("received" + req.body)
    const aopValues = WebWorker.FormatAop(data, req.body)
    //console.log(aopValues)
    res.status(200).send(aopValues)
  } catch(err) {
    res.status(500).send(err)
    console.log(err)
  }
}

/*
const axios = require('axios')

exports.getData = async (req, res) => {
  try {
    return res.status(200).send((await axios.get('https://front.dxp.delivery/db/devdb/find_documents/kafka/kafka/cjo', { headers: {"Authorization": "Bearer SBS155*" }})).data)
  } catch (error) {
    console.error(error)
  }

}
*/



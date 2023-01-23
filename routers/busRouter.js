const express = require('express')
const Router = express.Router()

// Import All Controller
const {busController} = require('../controllers') // Akan otomatis mengambil file index.js nya

const decodeToken = require('./../middleware/decodeToken')

Router.get('/search', busController.search)
Router.get('/details/:id', busController.details)
Router.post('/transaction/:bus_id', decodeToken, busController.createTransaction)

module.exports = Router
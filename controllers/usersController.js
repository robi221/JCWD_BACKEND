// Import Sequelize
const { sequelize } = require('./../models')
const { Op } = require('sequelize');

// To generate UID
const { v4: uuidv4 } = require('uuid');

// Import models
const db = require('./../models/index')
const users = db.users
// const bus = db.transaction
// const bus_rute = db.bus_rute
// const transaction_details = db.transaction_details
// const transactions =db.transactions
// const {bus} = require('./../models')
// const {bus_rute} = require('./../models')
// const {transaction_details} = require('./../models')
// const { transactions } = require('../models')

// const users_address = db.users_address

// Import hashing
const {hashPassword, hashMatch} = require("./../lib/hash")

// import jwt
const {createToken} = require('./../lib/jwt')

module.exports = {
    register: async(req, res) => {
        const t = await sequelize.transaction()
        try {
            // Step 1. Ambil data dari client (req..body)
            let {username, email, password, role} = req.body

            // Step 2. Validasi
            await users.create({username, email, password: await hashPassword(password), role})
            res.status(201).send({
                isError: false,
                message: 'Register Success',
                data: null
            })
        } catch (error) {
            res.status(500).send({
                isError: true,
                message: error.errors[0].message,
                data:null
            })
        }
    },
         

    login: async(req, res) => {
        try {
            // Step 1. Ambil data dari req.query            
            let {usernameOrEmail, password} = req.query
            
            // Step 2. Check username is exist or not
            let findUsernameOrEmail = await users.findOne({
                where: {
                    [Op.or]: [
                        {username: usernameOrEmail},
                        {email: usernameOrEmail}
                    ]
                }
            })

            if(!findUsernameOrEmail.dataValues) return res.status(404).send({
                isError: true,
                message: 'Username or Email Not Found',
                data: true
            })

            // Step 3. If username exist, hasmatch password dari req.query dan password dari database
            let hasMatchResult = await hashMatch(password, findUsernameOrEmail.dataValues.password)

            if(hasMatchResult === false) return res.status(404).send({
                isError: true,
                message: 'Password not valid',
                data: true
            })

            // let token = await createToken({id:findUsername.dataValues.id})

            // Step 4. Kirim response
            res.status(200).send({
                isError: false,
                message: 'Login Success',
                data: {
                    token: createToken({
                        id: findUsernameOrEmail.dataValues.id
                    })
                }
            })

        } catch (error){
            console.log(error)
        }
    }
}  
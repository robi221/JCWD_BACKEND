// Import Sequelize
const { sequelize } = require('./../models')
const { Op } = require('sequelize');

// To generate UID
const { v4: uuidv4 } = require('uuid');

// Import models
const db = require('./../models/index')
const users = db.users
const users_address = db.users_address

// Import hashing
const {hashPassword, hashMatch} = require("./../lib/hash")

// import jwt
const {createToken} = require('./../lib/jwt')

module.exports = {
    register: async(req, res) => {
        const t = await sequelize.transaction()
        try {
            // Step 1. Ambil data dari client (req..body)
            let {username, email, password, recipient, phone_number, address, city, province, postal_code} = req.body

            // Step 2. Validasi

            // Step 3. Insert data ke users
            let insertToUsers = await users.create({username, email, password: await hashPassword(password)}, {transaction: t})
            console.log(insertToUsers)
            let users_id = insertToUsers.dataValues.users_id
            
            // Step 4. Insert data ke users_address (membutuhkan id users)
            await users_address.create({recipient, phone_number, address, city, province, postal_code, users_id}, {transaction: t})

            // Step 5. Kirim response
            await t.commit()
            res.status(201).send({
                isError: false,
                message: 'Register Success',
                data: null
            })
        } catch (error) {
            await t.roolback()
            res.status(404).send({
                isError: true,
                message: error.message,
                data: null
            })
        }
    },

    login: async(req, res) => {
        try {
            // Step 1. Ambil data dari req.query            
            let {username, password} = req.query
            
            // Step 2. Check username is exist or not
            let findUsername = await users.findOne({
                where: {
                    username
                }
            })

            if(!findUsername) return res.status(404).send({
                isError: true,
                message: 'Username not exist',
                data: null
            })

            // Step 3. If username exist, hasmatch password dari req.query dan password dari database
            let hasMatchResult = await hashMatch(password, findUsername.dataValues.password)

            if(hasMatchResult === false) return res.status(404).send({
                isError: false,
                message: 'Password not valid',
                data: null
            })

            let token = await createToken({id:findUsername.dataValues.id})

            // Step 4. Kirim response
            res.status(201).send({
                isError: false,
                message: 'Login Success',
                data: token
            })

        } catch (error){
            console.log(error)
        }
    }
}   
// import sequelize
const { sequelize } = require('./../models')
const { Op } = require('sequelize')

// Import models
const db = require('./../models/index')
const bus = db.bus
const bus_rute = db.bus_rute
const transactions = db.transactions
const transaction_details = db.transaction_details

// Import hashing
const {hashPassword, hashMatch} = require('./../lib/hash')

// Import jwt
const {createToken} = require('./../lib/jwt')
const transporter = require('./../helpers/transporter')


module.exports = {
    search: async(req, res) => {
        try {
            let {schedule_date, from, to} = req.query

            let findBus = await sequelize.query(`SELECT b.id, b.name, br.from, br.to, br.price, br.total_seat, br.total_seat - COUNT(td.id) AS total_seat_available FROM transactions t 
            JOIN transaction_details td ON td.transactions_id = t.id
            RIGHT JOIN buses b ON (b.id = t.bus_id AND (t.schedule_date = ? OR t.schedule_date IS NULL))
            JOIN bus_rutes br ON br.bus_id = b.id
            WHERE br.from = ? AND br.to = ? ANd t.status != 'Expired'
            GROUP BY b.id;`, { 
                replacement: [schedule_date, from, to],
            type: sequelize.QueryTypes.SELECT 
        })

        res.status(200).send({
            isError: false,
            message: 'Search Bus Success',
            data: findBus
        })
        } catch (error) {
            console.log(error)
        }
    },

    details: async(req, res) => {
        try {
            console.log('Masukkk')
            let {id} = req.params
            console.log(id)
            let {schedule_date, from, to} = req.query

            let findBus = await sequelize.query(`
            SELECT b.id, b.name, br.from, br.to, br.price, br.total_seat, br.total_seat - COUNT(td.id) AS total_seat_available, group_concat(td.seat_number) AS seat_number_booked FROM transactions t 
            JOIN transaction_details td ON td.transactions_id = t.id
            RIGHT JOIN buses b ON (b.id = t.bus_id AND (t.schedule_date = ? OR t.schedule_date IS NULL))
            JOIN bus_rutes br ON br.bus_id = b.id
            WHERE br.from = ? AND br.to = ? AND b.id = ? AND t.status != 'Expired'
            GROUP BY b.id;
            `, {
                replacements: [schedule_date, from, to, id], 
                type: sequelize.QueryTypes.SELECT
            })

            res.status(200).send({
                isError: false, 
                message: 'Search Bus Success', 
                data: findBus
            })

        } catch (error) {
            console.log(error)
        }
    },

    createTransaction : async(req, res) => {
        const t = await sequelize.transaction()
        try {
            let {id} = req.dataDecode
            let {bus_id} = req.params
            let {bus_name, from, to, schedule_date, total_price, seat_number} = req.body

            let insertTransaction = await transactions.create({bus_name, from, to, schedule_date, total_price, bus_id, users_id: id}, {transaction: t})
            let insertId = insertTransaction.dataValues.id
            let findPrice = await bus_rute.findOne({
                where: {
                    [Op.and]: [
                        {
                            from,
                            to,
                            bus_id
                        }
                    ]
                }
            })

            let price = findPrice.dataValues.price

            let dataToSend = []
            seat_number.forEach((value) => {
                dataToSend.push({seat_number: value, price, transactions_id: insertId})
            })

            await transaction_details.bulkCreate(dataToSend, {transaction: t, ignoreDuplicates: true})

            await sequelize.query(`CREATE EVENT change_status_transactions_${insertId}
            ON SCHEDULE AT DATE_ADD(NOW(), INTERVAL 1 MINUTE)
            DO
                UPDATE transactions SET status = 'Expired'
                WHERE id = ?;`, {replacements: [insertId]})

            t.commit()

            res.status(201).send({
                isError: false,
                message: 'Transaction Success',
                data: null
            })

        } catch (error) {
            t.rollback()
            console.log(error)
        }
    },

    payment: async(req, res) => {
        // try {console.log('Masukkk')
        const t = await sequelize.transaction()
        try {
            
        // Step-1 Ambil id transaction dari req.params ---> Update status dari waiting for payment menjadi paid
            let {transaction_id} = req.params

        // Step-2 Simpan path image nya ke kolom payment proof sekaligus
        // Update status transaction
        await transactions.update({
            payment_proof: req.files.images[0].path,
            status: 'Paid'
        },
        {
            where: {
                id: transaction_id
            }
        },
        {transaction: t})

        // Step-3 Update status transaction

        // Step-4 Hapus event scheduler 
        await sequelize.query(`
        DROP EVENT IF EXISTS change_status_transactions_${transaction_id}`)

        // Step-5 Kirim invoice to users email
        await transporter.sendMail({
            from: 'Bus App',
            to: 'robismicel12@gmail.com', 
            subject: 'Invoice Transaction', 
            html: '<h1>Transaction Success</h1>'
        })
        t.commit()
        res.status(201).send({
            isError: false, 
            message: 'Transaction Success', 
            data: null
        })
        } catch (error) {
            t.rollback()
            console.log(error)
            // Step-6 Apabila ada step yang gagal, maka kita harus delete file nya
        }
    }
}
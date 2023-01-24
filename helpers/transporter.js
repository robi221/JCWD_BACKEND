const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'robismicel@gmail.com', // Email sender
        pass: 'ivkjyxkyzeqegrrr' // Key Generate
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter
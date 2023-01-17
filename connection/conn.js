const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ROBIMETAL42279",
    database: "Booked_application",
  });

db.connect((err) => {
    if(err) return console.log('Error ' + err.message)

    console.log('Connected to Database')
})

module.exports = db


1. npm i bcrypt cors express jsonwebtoken mysql2 nodemon sequelize sequelize
2. npx sequelize-cli init
3. buat nama tabel (npx sequelize-cli model:generate --name BOOKING --attributes code_booking:STRING,seat:INTEGER,price:INTEGER,status:ENUMnpx sequelize-cli model:generate --name BOOKING --attributes code_booking:STRING,seat:INTEGER,price:INTEGER,status:ENUM)
4. npx sequelize-cli db:migrate
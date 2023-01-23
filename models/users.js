// HashOne = one to one
// BelongsTo =
// HashMany = one to many
// BelongsToMany = Many to many


const { UUIDV4 } = require("sequelize");
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.transactions, {
        foreignKey: 'users_id'
      })
    }
  }
  users.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: UUIDV4
    },
    username: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Username Already in Use'
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {msg: 'Email Not Valid'}
      },
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      isAlphanumeric: true,
      max: {
        args: [10],
        msg: "Maximum 10 Characters Only"
      },
      min:{
        args: [6],
        msg: "Minimum 6 Characters Only"
      }
    },
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};
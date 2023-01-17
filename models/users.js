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
      // define association here / relasi
      this.hasMany(models.users_address, {
        foreignKey: 'users_id', 
        as: 'users_address'
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
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};
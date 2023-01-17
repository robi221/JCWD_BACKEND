'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users_address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {
        foreignKey: 'users_id',
        as: "users"
      })
    }
  }
  users_address.init({
    recipient: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postal_Code: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users_address',
  });
  return users_address;
};
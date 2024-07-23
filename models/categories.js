"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Categories.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Categories.hasOne(models.Tasks, {
        foreignKey: "category_id",
        as: "tasks",
      });
    }
  }
  Categories.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Categories",
      tableName: "categories",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Categories;
};

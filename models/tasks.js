"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tasks.belongsTo(models.User, {
        foreignKey: "user_id",
      });

      Tasks.belongsTo(models.Categories, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }
  Tasks.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      task_name: {
        allowNull: false,
        type: DataTypes.STRING(30),
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_important: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Tasks",
      tableName: "tasks",
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Tasks;
};

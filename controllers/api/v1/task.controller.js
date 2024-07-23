const { errorResponse, successResponse } = require("../../../utils/response");
const { StatusCodes } = require("http-status-codes");
const { Tasks, Categories } = require("./../../../models/index");

module.exports = {
  createTask: async (req, res) => {
    try {
      const { task_name } = req.body;
      const { userId } = req.jwtDecoded;
      if (!task_name) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không được để trống"
        );
      }
      if (task_name.trim().length > 30 || task_name.trim().length < 2) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task phải từ 2 đến 30 ký tự"
        );
      }
      const category_default = await Categories.findOne({
        where: {
          user_id: userId,
          category_name: "personal",
        },
      });
      await Tasks.create({
        task_name,
        category_id: category_default.id,
        user_id: userId,
      });
      return successResponse(
        res,
        StatusCodes.CREATED,
        "Tạo task mới thành công"
      );
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  getTask: async (req, res) => {
    try {
      const { userId } = req.jwtDecoded;
      const tasks = await Tasks.findAll({
        where: {
          user_id: userId,
          // is_deleted: false,
        },
        include: [
          {
            model: Categories,
            as: "category",
            attributes: ["category_name"],
          },
        ],
        attributes: [
          "id",
          "task_name",
          "is_completed",
          "is_important",
          "is_deleted",
          "deletedAt",
        ],
        paranoid: false,
      });
      return successResponse(
        res,
        StatusCodes.OK,
        "Lấy danh sách task thành công",
        tasks
      );
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  updateTask: async (req, res) => {
    try {
      const { task_id, task_name, is_completed, is_important, category_name } =
        req.body;
      const { userId } = req.jwtDecoded;
      if (!task_id) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }
      if (!task_name) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không được để trống"
        );
      }
      if (task_name.trim().length > 30 || task_name.trim().length < 2) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task phải từ 2 đến 30 ký tự"
        );
      }

      const task = await Tasks.findOne({
        where: {
          id: task_id,
          user_id: userId,
        },
      });

      if (!task) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }

      const category = await Categories.findOne({
        where: {
          user_id: userId,
          category_name,
        },
      });

      if (!category) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Category không tồn tại"
        );
      }

      await Tasks.update(
        {
          task_name,
          is_completed,
          is_important,
          category_id: category.id,
        },
        {
          where: {
            id: task_id,
            user_id: userId,
          },
        }
      );

      return successResponse(res, StatusCodes.OK, "Cập nhật task thành công");
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { task_id, is_completed } = req.body;
      const { userId } = req.jwtDecoded;

      const task = await Tasks.findOne({
        where: {
          id: task_id,
          user_id: userId,
        },
      });

      if (!task) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }

      await Tasks.update(
        {
          is_completed,
        },
        {
          where: {
            id: task_id,
            user_id: userId,
          },
        }
      );

      return successResponse(
        res,
        StatusCodes.OK,
        "Cập nhật trạng thái task thành công"
      );
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  softDeleteTask: async (req, res) => {
    try {
      const { task_id } = req.params;
      const { userId } = req.jwtDecoded;

      const task = await Tasks.findOne({
        where: {
          id: task_id,
          user_id: userId,
        },
      });

      if (!task) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }

      await Tasks.update(
        {
          is_deleted: true,
        },
        {
          where: {
            id: task_id,
            user_id: userId,
          },
        }
      );

      await Tasks.destroy({
        where: {
          id: task_id,
          user_id: userId,
        },
      });

      return successResponse(
        res,
        StatusCodes.OK,
        "Task đã được di chuyển vào thùng rác"
      );
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  restoreTask: async (req, res) => {
    try {
      const { task_id } = req.body;
      const { userId } = req.jwtDecoded;

      const task = await Tasks.findOne({
        where: {
          id: task_id,
          user_id: userId,
          is_deleted: true,
        },
        paranoid: false,
      });

      if (!task) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }

      await Tasks.update(
        {
          is_deleted: false,
        },
        {
          where: {
            id: task_id,
            user_id: userId,
          },
        }
      );

      await Tasks.restore({
        where: {
          id: task_id,
          user_id: userId,
        },
      });

      return successResponse(res, StatusCodes.OK, "Task đã được khôi phục");
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
  deleteTask: async (req, res) => {
    try {
      const { task_id } = req.params;
      const { userId } = req.jwtDecoded;

      const task = await Tasks.findOne({
        where: {
          id: task_id,
          user_id: userId,
        },
        paranoid: false,
      });

      if (!task) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Task không tồn tại"
        );
      }

      await Tasks.destroy({
        where: {
          id: task_id,
          user_id: userId,
        },
        force: true,
      });

      return successResponse(res, StatusCodes.OK, "Xóa task thành công");
    } catch (err) {
      console.log(err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  },
};

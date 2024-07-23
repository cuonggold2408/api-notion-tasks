var express = require("express");

var router = express.Router();

const taskController = require("../../controllers/api/v1/task.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/create-task", authMiddleware, taskController.createTask);

router.get("/get-task", authMiddleware, taskController.getTask);

router.put("/update-task", authMiddleware, taskController.updateTask);

// API này chỉ dùng để cập nhật lại trạng thái đã hoàn thành khi user nhấn vào checkbox
router.put("/update-status", authMiddleware, taskController.updateStatus);

router.delete(
  "/soft-delete-task/:task_id",
  authMiddleware,
  taskController.softDeleteTask
);

router.put("/restore-task", authMiddleware, taskController.restoreTask);

router.delete(
  "/delete-task/:task_id",
  authMiddleware,
  taskController.deleteTask
);

module.exports = router;

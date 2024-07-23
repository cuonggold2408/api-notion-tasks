var express = require("express");
var router = express.Router();
const authRouter = require("./auth/apiAuth");
const userRouter = require("./user/apiUser");
const taskRouter = require("./task/taskApi");

router.use("/auth", authRouter);

router.use("/user", userRouter);

router.use("/task", taskRouter);

module.exports = router;

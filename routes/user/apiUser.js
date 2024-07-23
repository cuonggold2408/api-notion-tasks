var express = require("express");
const userController = require("../../controllers/api/v1/user.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
var router = express.Router();

router.get("/profile", authMiddleware, userController.profile);

router.put("/refresh_token", userController.refreshToken);

module.exports = router;

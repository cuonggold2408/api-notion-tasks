var express = require("express");
const authController = require("../../controllers/api/v1/auth.controller");
var router = express.Router();

router.post("/login", authController.login);

router.post("/register", authController.register);

router.delete("/logout", authController.logout);

module.exports = router;

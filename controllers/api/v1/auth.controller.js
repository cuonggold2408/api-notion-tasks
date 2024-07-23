const { StatusCodes } = require("http-status-codes");
const { errorResponse, successResponse } = require("../../../utils/response");
const emailRegex = require("../../../utils/match_email");
const bcrypt = require("bcrypt");
const { User, Categories } = require("../../../models/index");
const { createAccessToken, createRefreshToken } = require("../../../utils/jwt");
const ms = require("ms");

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, password_confirm } = req.body;
      if (!name || !email || !password || !password_confirm) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Vui lòng nhập đầy đủ thông tin"
        );
      }
      if (!emailRegex(email)) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Email không hợp lệ"
        );
      }
      if (password.trim().length < 8) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Mật khẩu phải có ít nhất 8 ký tự"
        );
      }
      if (password !== password_confirm) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Mật khẩu không khớp"
        );
      }

      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashPassword = bcrypt.hashSync(password, salt);

      const user = await User.findOne({ where: { email } });
      if (user) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Email đã tồn tại");
      }

      const createUser = await User.create({
        user_name: name,
        email,
        password: hashPassword,
      });

      await Categories.create({
        user_id: createUser.id,
        category_name: "personal",
      });
      await Categories.create({
        user_id: createUser.id,
        category_name: "company",
      });
      await Categories.create({
        user_id: createUser.id,
        category_name: "idea",
      });
      await Categories.create({
        user_id: createUser.id,
        category_name: "friends",
      });

      return successResponse(res, StatusCodes.CREATED, "Đăng ký thành công");
    } catch (e) {
      return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Vui lòng nhập đầy đủ thông tin"
        );
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse(res, StatusCodes.NOT_FOUND, "Email không tồn tại");
      }
      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Mật khẩu không chính xác"
        );
      }

      const accessToken = createAccessToken({ userId: user.id });
      const refreshToken = createRefreshToken({ userId: user.id });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: ms("7 days"),
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: ms("7 days"),
      });

      return successResponse(res, StatusCodes.OK, "Đăng nhập thành công", {
        user: {
          name: user.user_name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return successResponse(res, StatusCodes.OK, "Đăng xuất thành công");
    } catch (error) {
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  },
};

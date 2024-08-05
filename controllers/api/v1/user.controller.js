const { errorResponse, successResponse } = require("../../../utils/response");
const { User } = require("../../../models/index");
const { StatusCodes } = require("http-status-codes");
const {
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
} = require("../../../utils/jwt");
const ms = require("ms");

module.exports = {
  profile: async (req, res) => {
    try {
      const { userId } = req.jwtDecoded;

      const user = await User.findByPk(userId, {
        attributes: ["user_name", "email"],
      });
      if (!user) {
        return errorResponse(res, StatusCodes.NOT_FOUND, "User not found");
      }

      const name = user.user_name;
      const email = user.email;

      return successResponse(
        res,
        StatusCodes.OK,
        "Lấy thông tin user thành công",
        {
          user: {
            name,
            email,
          },
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  },
  refreshToken: async (req, res) => {
    try {
      const refreshTokenFromCookie = req.cookies?.refreshToken;

      // Verify refreshToken
      const decodedRefreshToken = decodeRefreshToken(refreshTokenFromCookie);
      if (!decodedRefreshToken) {
        return errorResponse(res, StatusCodes.UNAUTHORIZED, "Invalid token");
      }

      // Tạo mới token

      const newAccessToken = createAccessToken({
        userId: decodedRefreshToken.userId,
      });
      const newRefreshToken = createRefreshToken({
        userId: decodedRefreshToken.userId,
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: ms("7d"),
        // cookie: {
        //   secure: true,
        //   sameSite: "none",
        // },
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: ms("7d"),
        // cookie: {
        //   secure: true,
        //   sameSite: "none",
        // },
      });

      return successResponse(res, StatusCodes.OK, "Refresh token thành công", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  },
};

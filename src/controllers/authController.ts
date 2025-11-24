import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

const authService = new AuthService();

export const registerEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const result = await authService.registerEmail(email, password);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const result = await authService.loginEmail(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }
);

export const requestPhoneOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError("Phone number is required", 400);
    }

    const result = await authService.requestPhoneOTP(phone);

    res.json({
      success: true,
      data: result,
    });
  }
);

export const verifyPhoneOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      throw new AppError("Phone and OTP are required", 400);
    }

    const result = await authService.verifyPhoneOTP(phone, otp);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await authService.logout(refreshToken);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

import db from "../config/database";
import { AppError } from "../middlewares/errorHandler";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateOTP, getOTPExpiry } from "../utils/otp";
import { User, JWTPayload } from "../types";

export class AuthService {
  // Register with email/password
  async registerEmail(email: string, password: string) {
    // Check if user exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError("Email already registered", 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await db.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );

    const user = result.rows[0];

    // Generate tokens
    const payload: JWTPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login with email/password
  async loginEmail(email: string, password: string) {
    // Find user
    const result = await db.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid credentials", 401);
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate tokens
    const payload: JWTPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  // Request OTP for phone login
  async requestPhoneOTP(phone: string) {
    // Check if user exists, if not create
    let result = await db.query("SELECT id FROM users WHERE phone = $1", [
      phone,
    ]);

    let userId: number;
    if (result.rows.length === 0) {
      // Create new user
      const newUser = await db.query(
        "INSERT INTO users (phone) VALUES ($1) RETURNING id",
        [phone]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = result.rows[0].id;
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete old OTPs for this user
    await db.query("DELETE FROM otp_codes WHERE user_id = $1", [userId]);

    // Store OTP
    await db.query(
      "INSERT INTO otp_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [userId, otp, expiresAt]
    );

    // In production, send OTP via SMS
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return {
      message: "OTP sent successfully",
      // For testing purposes only - remove in production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  }

  // Verify OTP and login
  async verifyPhoneOTP(phone: string, otp: string) {
    // Find user
    const userResult = await db.query(
      "SELECT id, phone FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    const user = userResult.rows[0];

    // Verify OTP
    const otpResult = await db.query(
      "SELECT code, expires_at FROM otp_codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    if (otpResult.rows.length === 0) {
      throw new AppError("No OTP found", 400);
    }

    const otpData = otpResult.rows[0];

    if (otpData.code !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    if (new Date() > new Date(otpData.expires_at)) {
      throw new AppError("OTP expired", 400);
    }

    // Delete used OTP
    await db.query("DELETE FROM otp_codes WHERE user_id = $1", [user.id]);

    // Generate tokens
    const payload: JWTPayload = { userId: user.id, phone: user.phone };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Check if refresh token exists in DB
      const result = await db.query(
        "SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
        [refreshToken]
      );

      if (result.rows.length === 0) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        phone: payload.phone,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  // Logout
  async logout(refreshToken: string) {
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
    return { message: "Logged out successfully" };
  }

  // Helper: Store refresh token
  private async storeRefreshToken(userId: number, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );
  }
}

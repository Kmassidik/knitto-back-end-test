import jwt, { SignOptions } from "jsonwebtoken"; // 1. Import SignOptions
import { JWTPayload } from "../types";

export const generateAccessToken = (payload: JWTPayload): string => {
  // 2. Create the options object with the specific type
  const signInOptions: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, signInOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const signInOptions: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, signInOptions);
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};

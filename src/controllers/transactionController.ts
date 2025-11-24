import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transactionService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

const transactionService = new TransactionService();

export const testConcurrentUpdate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, amounts } = req.body;

    if (!userId || !amounts || !Array.isArray(amounts)) {
      throw new AppError("userId and amounts array are required", 400);
    }

    if (amounts.length === 0) {
      throw new AppError("amounts array cannot be empty", 400);
    }

    const result = await transactionService.testConcurrentUpdate(
      userId,
      amounts
    );

    res.json({
      success: true,
      message: "Race condition test completed",
      data: result,
    });
  }
);

export const transferMoney = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fromUserId, toUserId, amount } = req.body;

    if (!fromUserId || !toUserId || !amount) {
      throw new AppError("fromUserId, toUserId, and amount are required", 400);
    }

    if (amount <= 0) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    if (fromUserId === toUserId) {
      throw new AppError("Cannot transfer to the same account", 400);
    }

    const result = await transactionService.transferMoney(
      fromUserId,
      toUserId,
      amount
    );

    res.json({
      success: true,
      message: "Transfer completed successfully",
      data: result,
    });
  }
);

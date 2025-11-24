import db from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export class TransactionService {
  // Update balance WITHOUT transaction (will cause race condition)
  async updateBalanceWithoutTransaction(userId: number, amount: number) {
    // Step 1: Read current balance
    const result = await db.query(
      "SELECT balance FROM accounts WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError("Account not found", 404);
    }

    const currentBalance = parseFloat(result.rows[0].balance);

    // Simulate some processing delay
    await this.delay(100);

    // Step 2: Calculate new balance
    const newBalance = currentBalance + amount;

    // Step 3: Update balance
    await db.query(
      "UPDATE accounts SET balance = $1, updated_at = NOW() WHERE user_id = $2",
      [newBalance, userId]
    );

    return {
      userId,
      previousBalance: currentBalance,
      amount,
      newBalance,
      method: "without-transaction",
    };
  }

  // Update balance WITH transaction (prevents race condition)
  async updateBalanceWithTransaction(userId: number, amount: number) {
    const client = await db.connect();

    try {
      // Start transaction
      await client.query("BEGIN");

      // Lock the row using SELECT FOR UPDATE
      const result = await client.query(
        "SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE",
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AppError("Account not found", 404);
      }

      const currentBalance = parseFloat(result.rows[0].balance);

      // Simulate some processing delay
      await this.delay(100);

      // Calculate new balance
      const newBalance = currentBalance + amount;

      // Update balance
      await client.query(
        "UPDATE accounts SET balance = $1, updated_at = NOW() WHERE user_id = $2",
        [newBalance, userId]
      );

      // Commit transaction
      await client.query("COMMIT");

      return {
        userId,
        previousBalance: currentBalance,
        amount,
        newBalance,
        method: "with-transaction",
      };
    } catch (error) {
      // Rollback on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Test race condition with concurrent updates
  async testConcurrentUpdate(userId: number, amounts: number[]) {
    // Get initial balance
    const initialResult = await db.query(
      "SELECT balance FROM accounts WHERE user_id = $1",
      [userId]
    );

    if (initialResult.rows.length === 0) {
      throw new AppError("Account not found", 404);
    }

    const initialBalance = parseFloat(initialResult.rows[0].balance);

    // Test WITHOUT transaction (will have race condition)
    await this.resetBalance(userId, initialBalance);
    const withoutTransactionPromises = amounts.map((amount) =>
      this.updateBalanceWithoutTransaction(userId, amount)
    );
    await Promise.all(withoutTransactionPromises);

    const balanceWithoutTransaction = await this.getBalance(userId);

    // Reset balance
    await this.resetBalance(userId, initialBalance);

    // Test WITH transaction (prevents race condition)
    const withTransactionPromises = amounts.map((amount) =>
      this.updateBalanceWithTransaction(userId, amount)
    );
    await Promise.all(withTransactionPromises);

    const balanceWithTransaction = await this.getBalance(userId);

    // Calculate expected balance
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const expectedBalance = initialBalance + totalAmount;

    return {
      initialBalance,
      amounts,
      totalAmount,
      expectedBalance,
      results: {
        withoutTransaction: {
          finalBalance: balanceWithoutTransaction,
          isCorrect: balanceWithoutTransaction === expectedBalance,
          difference: expectedBalance - balanceWithoutTransaction,
        },
        withTransaction: {
          finalBalance: balanceWithTransaction,
          isCorrect: balanceWithTransaction === expectedBalance,
          difference: expectedBalance - balanceWithTransaction,
        },
      },
    };
  }

  // Helper: Get current balance
  private async getBalance(userId: number): Promise<number> {
    const result = await db.query(
      "SELECT balance FROM accounts WHERE user_id = $1",
      [userId]
    );
    return parseFloat(result.rows[0].balance);
  }

  // Helper: Reset balance to specific amount
  private async resetBalance(userId: number, balance: number) {
    await db.query(
      "UPDATE accounts SET balance = $1, updated_at = NOW() WHERE user_id = $2",
      [balance, userId]
    );
  }

  // Helper: Delay function
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Complex transaction example: Transfer money between accounts
  async transferMoney(fromUserId: number, toUserId: number, amount: number) {
    const client = await db.connect();

    try {
      // Start transaction
      await client.query("BEGIN");

      // Lock both accounts (order by ID to prevent deadlock)
      const lockOrder =
        fromUserId < toUserId ? [fromUserId, toUserId] : [toUserId, fromUserId];

      const fromResult = await client.query(
        "SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE",
        [fromUserId]
      );

      const toResult = await client.query(
        "SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE",
        [toUserId]
      );

      if (fromResult.rows.length === 0 || toResult.rows.length === 0) {
        throw new AppError("Account not found", 404);
      }

      const fromBalance = parseFloat(fromResult.rows[0].balance);
      const toBalance = parseFloat(toResult.rows[0].balance);

      // Check sufficient balance
      if (fromBalance < amount) {
        throw new AppError("Insufficient balance", 400);
      }

      // Deduct from sender
      await client.query(
        "UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2",
        [amount, fromUserId]
      );

      // Add to receiver
      await client.query(
        "UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2",
        [amount, toUserId]
      );

      // Log transaction (assuming we have a transactions table)
      // await client.query(
      //   'INSERT INTO transactions (from_user_id, to_user_id, amount, type) VALUES ($1, $2, $3, $4)',
      //   [fromUserId, toUserId, amount, 'transfer']
      // );

      // Commit transaction
      await client.query("COMMIT");

      return {
        fromUserId,
        toUserId,
        amount,
        fromPreviousBalance: fromBalance,
        fromNewBalance: fromBalance - amount,
        toPreviousBalance: toBalance,
        toNewBalance: toBalance + amount,
      };
    } catch (error) {
      // Rollback on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

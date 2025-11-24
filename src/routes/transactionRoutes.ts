import { Router } from "express";
import {
  testConcurrentUpdate,
  transferMoney,
} from "../controllers/transactionController";

const router = Router();

/**
 * @swagger
 * /api/transactions/test/concurrent-update:
 *   post:
 *     summary: Test race condition with concurrent balance updates
 *     tags: [Transactions]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amounts
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               amounts:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [100, 200, 150, 50, 300]
 *     responses:
 *       200:
 *         description: Race condition test completed
 */
router.post("/test/concurrent-update", testConcurrentUpdate);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfer money between accounts
 *     tags: [Transactions]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromUserId
 *               - toUserId
 *               - amount
 *             properties:
 *               fromUserId:
 *                 type: integer
 *                 example: 1
 *               toUserId:
 *                 type: integer
 *                 example: 2
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *       400:
 *         description: Insufficient balance
 */
router.post("/transfer", transferMoney);

export default router;

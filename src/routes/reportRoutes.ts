import { Router } from "express";
import {
  getTopCustomers,
  getSalesByDateRange,
  getAverageProductsPerMonth,
  getCustomerGrowth,
  getSystemActivitySummary,
} from "../controllers/reportController";
import { authenticate } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * /api/reports/top-customers:
 *   get:
 *     summary: Get top customers by total purchases
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top customers report
 */
router.get("/top-customers", authenticate, getTopCustomers);

/**
 * @swagger
 * /api/reports/sales-by-date:
 *   get:
 *     summary: Get sales report by date range
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Sales report by date range
 */
router.get("/sales-by-date", authenticate, getSalesByDateRange);

/**
 * @swagger
 * /api/reports/monthly-average:
 *   get:
 *     summary: Get average products sold per month
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2025
 *     responses:
 *       200:
 *         description: Monthly average report
 */
router.get("/monthly-average", authenticate, getAverageProductsPerMonth);

/**
 * @swagger
 * /api/reports/customer-growth:
 *   get:
 *     summary: Get customer growth over time
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Customer growth report
 */
router.get("/customer-growth", authenticate, getCustomerGrowth);

/**
 * @swagger
 * /api/reports/system-summary:
 *   get:
 *     summary: Get system activity summary
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: System activity summary
 */
router.get("/system-summary", authenticate, getSystemActivitySummary);

export default router;

import { Router } from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceByCode,
  testRaceCondition,
} from "../controllers/invoiceController";
import { authenticate } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice with unique code
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 example: {"customer": "John Doe", "amount": 100000}
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createInvoice);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get("/", authenticate, getAllInvoices);

/**
 * @swagger
 * /api/invoices/{code}:
 *   get:
 *     summary: Get invoice by code
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: INV-20251123-00001
 *     responses:
 *       200:
 *         description: Invoice found
 *       404:
 *         description: Invoice not found
 */
router.get("/:code", authenticate, getInvoiceByCode);

/**
 * @swagger
 * /api/invoices/test/race-condition:
 *   post:
 *     summary: Test race condition handling (create multiple invoices simultaneously)
 *     tags: [Invoices]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 5
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Test completed
 */
router.post("/test/race-condition", testRaceCondition);

export default router;

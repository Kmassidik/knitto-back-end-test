import { Router } from "express";
import {
  getTasksInfo,
  runTaskManually,
  stopTask,
} from "../controllers/taskController";

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all scheduled tasks info
 *     tags: [Tasks]
 *     security: []
 *     responses:
 *       200:
 *         description: List of scheduled tasks
 */
router.get("/", getTasksInfo);

/**
 * @swagger
 * /api/tasks/run/{taskName}:
 *   post:
 *     summary: Manually run a specific task
 *     tags: [Tasks]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: taskName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [clean-otp, clean-tokens, daily-report, log-stats]
 *         example: log-stats
 *     responses:
 *       200:
 *         description: Task executed successfully
 */
router.post("/run/:taskName", runTaskManually);

/**
 * @swagger
 * /api/tasks/stop/{taskName}:
 *   post:
 *     summary: Stop a specific task
 *     tags: [Tasks]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: taskName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task stopped successfully
 */
router.post("/stop/:taskName", stopTask);

export default router;

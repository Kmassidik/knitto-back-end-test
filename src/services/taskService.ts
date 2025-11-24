import cron, { ScheduledTask } from "node-cron";
import db from "../config/database";

export class TaskService {
  private tasks: Map<string, ScheduledTask> = new Map();

  // Initialize all scheduled tasks
  initializeTasks() {
    console.log("Initializing scheduled tasks...");

    // Task 1: Clean old OTP codes every hour
    this.scheduleTask(
      "clean-otp",
      "0 * * * *", // Every hour at minute 0
      this.cleanOldOtpCodes
    );

    // Task 2: Clean expired refresh tokens every day at midnight
    this.scheduleTask(
      "clean-tokens",
      "0 0 * * *", // Every day at 00:00
      this.cleanExpiredTokens
    );

    // Task 3: Generate daily report every day at 8 AM
    this.scheduleTask(
      "daily-report",
      "0 8 * * *", // Every day at 08:00
      this.generateDailyReport
    );

    // Task 4: Log active users every 5 minutes (demo)
    this.scheduleTask(
      "log-stats",
      "*/5 * * * *", // Every 5 minutes
      this.logSystemStats
    );

    console.log(`${this.tasks.size} scheduled tasks initialized`);
  }

  // Schedule a task
  private scheduleTask(
    name: string,
    cronExpression: string,
    taskFunction: () => Promise<void>
  ) {
    const task = cron.schedule(cronExpression, async () => {
      console.log(`Running scheduled task: ${name}`);
      try {
        await taskFunction();
        console.log(`Task completed: ${name}`);
      } catch (error) {
        console.error(`Task failed: ${name}`, error);
      }
    });

    this.tasks.set(name, task);
    console.log(`Scheduled task: ${name} (${cronExpression})`);
  }

  // Task 1: Clean old OTP codes
  private cleanOldOtpCodes = async () => {
    const result = await db.query(
      "DELETE FROM otp_codes WHERE expires_at < NOW()"
    );
    console.log(`Cleaned ${result.rowCount} expired OTP codes`);
  };

  // Task 2: Clean expired refresh tokens
  private cleanExpiredTokens = async () => {
    const result = await db.query(
      "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
    );
    console.log(`Cleaned ${result.rowCount} expired refresh tokens`);
  };

  // Task 3: Generate daily report
  private generateDailyReport = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Count today's invoices
    const invoiceResult = await db.query(
      `SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = $1`,
      [today]
    );

    // Count today's users
    const userResult = await db.query(
      `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = $1`,
      [today]
    );

    console.log(`Daily Report (${today}):`);
    console.log(`   - New Users: ${userResult.rows[0].count}`);
    console.log(`   - New Invoices: ${invoiceResult.rows[0].count}`);
  };

  // Task 4: Log system stats
  private logSystemStats = async () => {
    const userCount = await db.query("SELECT COUNT(*) as count FROM users");
    const invoiceCount = await db.query(
      "SELECT COUNT(*) as count FROM invoices"
    );

    console.log(`System Stats:`);
    console.log(`   - Total Users: ${userCount.rows[0].count}`);
    console.log(`   - Total Invoices: ${invoiceCount.rows[0].count}`);
  };

  // Get all scheduled tasks info
  getTasksInfo() {
    const tasksInfo = Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      status: "running",
    }));

    return tasksInfo;
  }

  // Manually run a task (for testing)
  async runTaskManually(taskName: string) {
    const taskFunctions: Record<string, () => Promise<void>> = {
      "clean-otp": this.cleanOldOtpCodes,
      "clean-tokens": this.cleanExpiredTokens,
      "daily-report": this.generateDailyReport,
      "log-stats": this.logSystemStats,
    };

    const taskFunction = taskFunctions[taskName];

    if (!taskFunction) {
      throw new Error(`Task not found: ${taskName}`);
    }

    console.log(`Manually running task: ${taskName}`);
    await taskFunction();
    console.log(`Task completed: ${taskName}`);

    return { message: `Task ${taskName} executed successfully` };
  }

  // Stop a specific task
  stopTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      console.log(`Stopped task: ${taskName}`);
      return { message: `Task ${taskName} stopped` };
    }
    throw new Error(`Task not found: ${taskName}`);
  }

  // Stop all tasks
  stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`Stopped task: ${name}`);
    });
    this.tasks.clear();
    console.log("All tasks stopped");
  }
}

// Singleton instance
export const taskService = new TaskService();

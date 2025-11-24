import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import dogApiRoutes from "./routes/dogApiRoutes";
import taskRoutes from "./routes/taskRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import reportRoutes from "./routes/reportRoutes";
import { taskService } from "./services/taskService";
import db from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Knitto Backend Test API",
    version: "1.0.0",
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      auth: "/api/auth",
      invoices: "/api/invoices",
      dogs: "/api/dogs",
      tasks: "/api/tasks",
      transactions: "/api/transactions",
      reports: "/api/reports",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dogs", dogApiRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);

// Error handler
app.use(errorHandler);

// Check required tables
const checkTables = async () => {
  const requiredTables = [
    "users",
    "otp_codes",
    "refresh_tokens",
    "invoices",
    "accounts",
    "customers",
    "orders",
  ];

  const result = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  const existingTables = result.rows.map((row) => row.table_name);
  const missingTables = requiredTables.filter(
    (table) => !existingTables.includes(table)
  );

  if (missingTables.length > 0) {
    console.error("Missing tables:", missingTables.join(", "));
    console.error("Run: docker-compose down -v && docker-compose up -d");
    return false;
  }

  console.log(`All required tables exist (${requiredTables.length} tables)`);
  return true;
};

// Check database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.query("SELECT 1");
    console.log("Database connected");

    // Check required tables
    const tablesExist = await checkTables();
    if (!tablesExist) {
      process.exit(1);
    }

    // Initialize scheduled tasks
    taskService.initializeTasks();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    console.error("Make sure PostgreSQL is running: docker-compose up -d");
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, stopping tasks...");
  taskService.stopAllTasks();
  db.end();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, stopping tasks...");
  taskService.stopAllTasks();
  db.end();
  process.exit(0);
});

// Start the application
startServer();

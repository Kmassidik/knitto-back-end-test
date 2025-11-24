import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/taskService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

export const getTasksInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tasks = taskService.getTasksInfo();

    res.json({
      success: true,
      message: "Scheduled tasks information",
      data: {
        tasks,
        total: tasks.length,
      },
    });
  }
);

export const runTaskManually = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskName } = req.params;

    if (!taskName) {
      throw new AppError("Task name is required", 400);
    }

    const result = await taskService.runTaskManually(taskName);

    res.json({
      success: true,
      data: result,
    });
  }
);

export const stopTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskName } = req.params;

    if (!taskName) {
      throw new AppError("Task name is required", 400);
    }

    const result = taskService.stopTask(taskName);

    res.json({
      success: true,
      data: result,
    });
  }
);

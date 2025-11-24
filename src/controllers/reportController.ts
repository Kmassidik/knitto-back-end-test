import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/reportService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

const reportService = new ReportService();

export const getTopCustomers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 100) {
      throw new AppError("Limit must be between 1 and 100", 400);
    }

    const data = await reportService.getTopCustomers(limit);

    res.json({
      success: true,
      message: "Top customers report generated",
      data,
    });
  }
);

export const getSalesByDateRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError("startDate and endDate are required", 400);
    }

    const data = await reportService.getSalesByDateRange(
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      message: "Sales report by date range generated",
      data,
    });
  }
);

export const getAverageProductsPerMonth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    if (year < 2000 || year > 2100) {
      throw new AppError("Invalid year", 400);
    }

    const data = await reportService.getAverageProductsPerMonth(year);

    res.json({
      success: true,
      message: "Average products per month report generated",
      data,
    });
  }
);

export const getCustomerGrowth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError("startDate and endDate are required", 400);
    }

    const data = await reportService.getCustomerGrowth(
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      message: "Customer growth report generated",
      data,
    });
  }
);

export const getSystemActivitySummary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await reportService.getSystemActivitySummary();

    res.json({
      success: true,
      message: "System activity summary generated",
      data,
    });
  }
);

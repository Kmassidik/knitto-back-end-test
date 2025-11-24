import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/invoiceService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

const invoiceService = new InvoiceService();

export const createInvoice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { data } = req.body;

    if (!data) {
      throw new AppError("Invoice data is required", 400);
    }

    const invoice = await invoiceService.createInvoice(data);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  }
);

export const getAllInvoices = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const invoices = await invoiceService.getAllInvoices(limit, offset);

    res.json({
      success: true,
      data: invoices,
    });
  }
);

export const getInvoiceByCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;

    const invoice = await invoiceService.getInvoiceByCode(code);

    res.json({
      success: true,
      data: invoice,
    });
  }
);

export const testRaceCondition = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const count = parseInt(req.query.count as string) || 5;

    if (count > 20) {
      throw new AppError("Maximum 20 concurrent requests allowed", 400);
    }

    const result = await invoiceService.testRaceCondition(count);

    res.json({
      success: true,
      data: result,
    });
  }
);
